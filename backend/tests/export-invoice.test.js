import { describe, it, expect, vi } from 'vitest'

import {
  exportInvoicePdf
} from '../src/services/invoice-pdf.service.js'

// T-06.1 - RED: Teste vizualizare si export PDF

const authenticatedUser = {
  id: 'user-123',
  companyId: 'company-A'
}

const savedInvoice = {
  id: 'invoice-123',
  company_id: 'company-A',
  client_id: 'client-123',
  invoice_number: 1,
  issue_date: '2026-11-20',
  subtotal: 200,
  vat_amount: 42,
  total: 242
}

const savedItems = [
  {
    id: 'item-123',
    invoice_id: 'invoice-123',
    product_id: 'product-123',
    description: 'Servicii consultanta',
    quantity: 2,
    unit_price: 100,
    line_total: 200
  }
]

const company = {
  id: 'company-A',
  name: 'HomeStyle Furniture SRL',
  cui: 'RO12345678',
  address: 'Bucuresti, Romania',
  email: 'contact@homestyle.ro',
  invoice_prefix: 'HSF'
}

const client = {
  id: 'client-123',
  name: 'Client Exemplu SRL',
  cui: 'RO87654321',
  address: 'Brasov, Romania',
  email: 'client@exemplu.ro'
}

// Simuleaza interogarile Supabase pentru datele salvate.
function createMockSupabase({
  invoiceExists = true,
  invoiceCompanyId = 'company-A'
} = {}) {
  const from = vi.fn((table) => {
    const filters = {}

    const query = {
      select: vi.fn(() => query),

      eq: vi.fn((column, value) => {
        filters[column] = value
        return query
      }),

      order: vi.fn(() => query),

      maybeSingle: vi.fn(async () => {
        if (table === 'invoices') {
          const allowed =
            invoiceExists &&
            filters.id === savedInvoice.id &&
            filters.company_id === invoiceCompanyId

          return {
            data: allowed
              ? {
                  ...savedInvoice,
                  company_id: invoiceCompanyId
                }
              : null,
            error: null
          }
        }

        if (table === 'companies') {
          return {
            data: filters.id === company.id
              ? company
              : null,
            error: null
          }
        }

        if (table === 'clients') {
          const allowed =
            filters.id === client.id &&
            filters.company_id === 'company-A'

          return {
            data: allowed ? client : null,
            error: null
          }
        }

        return { data: null, error: null }
      }),

      then(resolve, reject) {
        let data = []

        if (table === 'invoice_items') {
          data = filters.invoice_id === savedInvoice.id
            ? savedItems
            : []
        }

        return Promise.resolve({
          data,
          error: null
        }).then(resolve, reject)
      }
    }

    return query
  })

  return { from }
}

// Simuleaza jsPDF, fara generarea unui fisier real.
function createMockPdf() {
  const document = {
    text: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    line: vi.fn(),
    addPage: vi.fn(),
    output: vi.fn(() =>
      new Uint8Array([37, 80, 68, 70]).buffer
    )
  }

  return {
    document,
    createDocument: vi.fn(() => document)
  }
}

function writtenText(document) {
  return document.text.mock.calls
    .map(call => String(call[0]))
    .join(' | ')
}

describe('US-06 - Vizualizare si export factura PDF', () => {
  it('permite exportul numai pentru facturi salvate', async () => {
    const supabase = createMockSupabase({
      invoiceExists: false
    })

    const pdf = createMockPdf()

    const result = await exportInvoicePdf(
      'invoice-inexistent',
      authenticatedUser,
      supabase,
      pdf.createDocument
    )

    expect(result.success).toBe(false)
    expect(pdf.createDocument).not.toHaveBeenCalled()
  })

  it('include datele corecte ale furnizorului si clientului', async () => {
    const supabase = createMockSupabase()
    const pdf = createMockPdf()

    const result = await exportInvoicePdf(
      savedInvoice.id,
      authenticatedUser,
      supabase,
      pdf.createDocument
    )

    expect(result.success).toBe(true)

    const content = writtenText(pdf.document)

    expect(content).toContain('HomeStyle Furniture SRL')
    expect(content).toContain('RO12345678')
    expect(content).toContain('Client Exemplu SRL')
    expect(content).toContain('RO87654321')
  })

  it('include pozitiile si valorile facturii', async () => {
    const supabase = createMockSupabase()
    const pdf = createMockPdf()

    const result = await exportInvoicePdf(
      savedInvoice.id,
      authenticatedUser,
      supabase,
      pdf.createDocument
    )

    expect(result.success).toBe(true)

    const content = writtenText(pdf.document)

    expect(content).toContain('Servicii consultanta')
    expect(content).toContain('2')
    expect(content).toContain('100.00')
    expect(content).toContain('200.00')
  })

  it('foloseste totalurile facturii salvate', async () => {
    const supabase = createMockSupabase()
    const pdf = createMockPdf()

    const result = await exportInvoicePdf(
      savedInvoice.id,
      authenticatedUser,
      supabase,
      pdf.createDocument
    )

    expect(result.success).toBe(true)

    const content = writtenText(pdf.document)

    expect(content).toContain('200.00')
    expect(content).toContain('42.00')
    expect(content).toContain('242.00')

    expect(pdf.document.output)
      .toHaveBeenCalledWith('arraybuffer')
  })

  it('respinge exportul facturilor altei companii', async () => {
    const supabase = createMockSupabase({
      invoiceCompanyId: 'company-B'
    })

    const pdf = createMockPdf()

    const result = await exportInvoicePdf(
      savedInvoice.id,
      authenticatedUser,
      supabase,
      pdf.createDocument
    )

    expect(result.success).toBe(false)
    expect(pdf.createDocument).not.toHaveBeenCalled()
  })
})
