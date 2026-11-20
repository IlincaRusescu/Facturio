
import { jsPDF } from 'jspdf'

import {
  money,
  formatDate,
  safeText,
  shortText
} from '../utils/invoice-pdf.formatter.js'

// T-06.3 - REFACTOR: Export PDF pentru facturile salvate

function failure(message) {
  return {
    success: false,
    errors: [message]
  }
}

// Genereaza PDF numai pentru o factura salvata
// care apartine companiei autentificate.
export async function exportInvoicePdf(
  invoiceId,
  user,
  supabase,
  createDocument = () => new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
) {
  if (!user?.companyId || !supabase) {
    return failure('Autentificare necesara')
  }

  if (!invoiceId) {
    return failure('Factura nu a fost specificata')
  }

  try {
    // 1. Verificarea facturii si a companiei
    const { data: invoice, error: invoiceError } =
      await supabase
        .from('invoices')
        .select(
          'id, company_id, client_id, invoice_number, ' +
          'issue_date, subtotal, vat_amount, total'
        )
        .eq('id', invoiceId)
        .eq('company_id', user.companyId)
        .maybeSingle()

    if (invoiceError) {
      return failure('Nu s-a putut incarca factura')
    }

    if (!invoice) {
      return failure('Factura nu a fost gasita')
    }

    // 2. Datele furnizorului
    const { data: company, error: companyError } =
      await supabase
        .from('companies')
        .select(
          'id, name, cui, address, email, invoice_prefix'
        )
        .eq('id', user.companyId)
        .maybeSingle()

    if (companyError || !company) {
      return failure('Furnizorul nu a fost gasit')
    }

    // 3. Datele clientului
    const { data: client, error: clientError } =
      await supabase
        .from('clients')
        .select('id, name, cui, address, email')
        .eq('id', invoice.client_id)
        .eq('company_id', user.companyId)
        .maybeSingle()

    if (clientError || !client) {
      return failure('Clientul facturii nu a fost gasit')
    }

    // 4. Pozitiile facturii
    const { data: items, error: itemsError } =
      await supabase
        .from('invoice_items')
        .select(
          'id, invoice_id, product_id, description, ' +
          'quantity, unit_price, line_total'
        )
        .eq('invoice_id', invoice.id)

    if (itemsError || !items?.length) {
      return failure('Factura nu contine pozitii valide')
    }

    // 5. Crearea documentului jsPDF
    const pdf = createDocument()

    const prefix = safeText(company.invoice_prefix)
    const number = String(invoice.invoice_number).padStart(3, '0')
    const invoiceLabel = `${prefix}-${number}`

    // ANTET
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(24)
    pdf.text('FACTURA', 18, 25)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.text(`Serie si numar: ${invoiceLabel}`, 18, 34)
    pdf.text(
      `Data: ${formatDate(invoice.issue_date)}`,
      18,
      41
    )

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(15)
    pdf.text(`${money(invoice.total)} RON`, 192, 25, {
      align: 'right'
    })

    pdf.line(18, 49, 192, 49)

    // FURNIZOR
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text('FURNIZOR', 18, 61)

    pdf.setFontSize(10)
    pdf.text(shortText(company.name, 37), 18, 70)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text(`CUI: ${safeText(company.cui)}`, 18, 77)
    pdf.text(shortText(company.address, 37), 18, 84)
    pdf.text(shortText(company.email, 37), 18, 91)

    // CLIENT
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text('CLIENT', 110, 61)

    pdf.setFontSize(10)
    pdf.text(shortText(client.name, 37), 110, 70)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text(`CUI: ${safeText(client.cui)}`, 110, 77)
    pdf.text(shortText(client.address, 37), 110, 84)
    pdf.text(shortText(client.email, 37), 110, 91)

    // TABELUL PRODUSELOR
    function drawTableHeader(y) {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)

      pdf.text('PRODUS / SERVICIU', 18, y)
      pdf.text('CANT.', 119, y)
      pdf.text('PRET', 145, y)
      pdf.text('VALOARE', 192, y, {
        align: 'right'
      })

      pdf.line(18, y + 3, 192, y + 3)
    }

    let y = 112
    drawTableHeader(y)
    y += 12

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)

    for (const item of items) {
      // Trecere pe pagina urmatoare daca este necesar
      if (y > 256) {
        pdf.addPage()
        y = 25
        drawTableHeader(y)
        y += 12
      }

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)

      pdf.text(shortText(item.description, 45), 18, y)
      pdf.text(String(item.quantity), 119, y)
      pdf.text(money(item.unit_price), 145, y)

      pdf.setFont('helvetica', 'bold')
      pdf.text(money(item.line_total), 192, y, {
        align: 'right'
      })

      pdf.line(18, y + 4, 192, y + 4)
      y += 11
    }

    // Spatiu pentru totaluri
    if (y > 245) {
      pdf.addPage()
      y = 30
    } else {
      y += 12
    }

    // TOTALURI - folosim valorile salvate
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)

    pdf.text('Subtotal:', 135, y)
    pdf.text(money(invoice.subtotal), 192, y, {
      align: 'right'
    })

    y += 9

    pdf.text('TVA:', 135, y)
    pdf.text(money(invoice.vat_amount), 192, y, {
      align: 'right'
    })

    y += 6
    pdf.line(130, y, 192, y)

    y += 10

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(13)

    pdf.text('TOTAL:', 135, y)
    pdf.text(`${money(invoice.total)} RON`, 192, y, {
      align: 'right'
    })

    // 6. Generarea datelor binare PDF
    const arrayBuffer = pdf.output('arraybuffer')
    const buffer = Buffer.from(arrayBuffer)

    const safePrefix =
      prefix.replace(/[^a-zA-Z0-9_-]/g, '') || 'FACTURIO'

    return {
      success: true,
      buffer,
      filename: `${safePrefix}-${number}.pdf`
    }
  } catch {
    return failure('Nu s-a putut genera documentul PDF')
  }
}
