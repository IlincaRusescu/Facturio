import { describe, it, expect, vi } from 'vitest'

import {
  createInvoice,
  calculateInvoiceTotals
} from '../src/services/invoices.service.js'

// T-05.1 - RED: Teste creare factura
// Date demonstrative, fara conectare la Supabase real

const user = {
  id: 'user-123',
  companyId: 'company-A'
}

const validInvoice = {
  clientId: 'client-123',
  issueDate: '2026-11-20',
  items: [
    {
      productId: 'product-123',
      description: 'Servicii consultanta',
      quantity: 2,
      unitPrice: 100
    }
  ]
}

// Simuleaza operatiile Supabase necesare testelor.
// Nu modifica baza de date reala.
function createMockSupabase({
  clientCompanyId = 'company-A'
} = {}) {
  const savedInvoices = []
  const savedItems = []

  const from = vi.fn((table) => {
    const filters = {}
    let inserted = null

    const query = {
      select: vi.fn(() => query),

      eq: vi.fn((column, value) => {
        filters[column] = value
        return query
      }),

      order: vi.fn(() => query),
      limit: vi.fn(() => query),

      maybeSingle: vi.fn(async () => {
        if (table === 'clients') {
          const allowed =
            filters.id === 'client-123' &&
            filters.company_id === clientCompanyId

          return {
            data: allowed
              ? {
                  id: 'client-123',
                  company_id: clientCompanyId
                }
              : null,
            error: null
          }
        }

        if (table === 'invoices') {
          const invoices = savedInvoices.filter(
            (invoice) =>
              invoice.company_id === filters.company_id
          )

          const latest = [...invoices].sort(
            (a, b) =>
              b.invoice_number - a.invoice_number
          )[0]

          return {
            data: latest || null,
            error: null
          }
        }

        if (table === 'products') {
          const allowed =
            filters.id === 'product-123' &&
            filters.company_id === 'company-A'

          return {
            data: allowed
              ? {
                  id: 'product-123',
                  company_id: 'company-A',
                  name: 'Servicii consultanta',
                  type: 'service',
                  unit_price: 100
                }
              : null,
            error: null
          }
        }

        return { data: null, error: null }
      }),

      single: vi.fn(async () => ({
        data: inserted,
        error: null
      })),

      insert: vi.fn((payload) => {
        if (table === 'invoices') {
          inserted = {
            ...payload,
            id: `invoice-${savedInvoices.length + 1}`
          }
          savedInvoices.push(inserted)
        }

        if (table === 'invoice_items') {
          const rows = Array.isArray(payload)
            ? payload
            : [payload]

          inserted = rows.map((item, index) => ({
            ...item,
            id: `item-${savedItems.length + index + 1}`
          }))

          savedItems.push(...inserted)
        }

        return query
      }),

      then(resolve, reject) {
        return Promise.resolve({
          data: inserted,
          error: null
        }).then(resolve, reject)
      }
    }

    return query
  })

  return {
    from,
    savedInvoices,
    savedItems
  }
}

describe('US-05 - Creare factura', () => {
  it('creeaza factura cu client valid si pozitii', async () => {
    const supabase = createMockSupabase()

    const result = await createInvoice(
      validInvoice,
      user,
      supabase
    )

    expect(result.success).toBe(true)
    expect(result.invoice.client_id).toBe('client-123')
    expect(result.invoice.company_id).toBe('company-A')
    expect(supabase.savedInvoices).toHaveLength(1)
  })

  it('respinge factura fara client sau pozitii', async () => {
    const supabase = createMockSupabase()

    const withoutClient = await createInvoice(
      { ...validInvoice, clientId: '' },
      user,
      supabase
    )

    const withoutItems = await createInvoice(
      { ...validInvoice, items: [] },
      user,
      supabase
    )

    expect(withoutClient.success).toBe(false)
    expect(withoutItems.success).toBe(false)
    expect(supabase.savedInvoices).toHaveLength(0)
  })

  it('genereaza numere unice de factura in companie', async () => {
    const supabase = createMockSupabase()

    const first = await createInvoice(
      validInvoice,
      user,
      supabase
    )

    const second = await createInvoice(
      validInvoice,
      user,
      supabase
    )

    expect(first.success).toBe(true)
    expect(second.success).toBe(true)

    const numbers = supabase.savedInvoices.map(
      (invoice) => invoice.invoice_number
    )

    expect(numbers).toHaveLength(2)
    expect(numbers.every(Number.isInteger)).toBe(true)
    expect(new Set(numbers).size).toBe(2)
  })

  it('salveaza factura si pozitiile asociate', async () => {
    const supabase = createMockSupabase()

    const result = await createInvoice(
      validInvoice,
      user,
      supabase
    )

    expect(result.success).toBe(true)
    expect(supabase.savedInvoices).toHaveLength(1)
    expect(supabase.savedItems).toHaveLength(1)

    expect(supabase.savedItems[0]).toEqual(
      expect.objectContaining({
        invoice_id: result.invoice.id,
        product_id: 'product-123',
        description: 'Servicii consultanta',
        quantity: 2,
        unit_price: 100,
        line_total: 200
      })
    )
  })

  it('respinge clientii altei companii', async () => {
    const supabase = createMockSupabase({
      clientCompanyId: 'company-B'
    })

    const result = await createInvoice(
      validInvoice,
      user,
      supabase
    )

    expect(result.success).toBe(false)
    expect(supabase.savedInvoices).toHaveLength(0)
    expect(supabase.savedItems).toHaveLength(0)
  })

  it('calculeaza subtotalul, TVA-ul si totalul', () => {
    const result = calculateInvoiceTotals(
      validInvoice.items
    )

    expect(result.subtotal).toBe(200)
    expect(result.vatAmount).toBe(42)
    expect(result.total).toBe(242)
  })
})
