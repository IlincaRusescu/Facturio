
import { randomUUID } from 'node:crypto'

// Configuratie demonstrativa FACTURIO
const VAT_RATE = 0.21

function failure(message) {
  return {
    success: false,
    errors: [message]
  }
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function isPositiveMoney(value) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    Math.round(value * 100) / 100 === value
  )
}

function validateInvoice(invoice) {
  const errors = []

  if (!invoice || typeof invoice !== 'object') {
    return ['Datele facturii sunt invalide']
  }

  if (!invoice.clientId) {
    errors.push('Selectarea clientului este obligatorie')
  }

  if (!Array.isArray(invoice.items) ||
      invoice.items.length === 0) {
    errors.push('Factura trebuie sa contina cel putin o pozitie')
  } else {
    for (const item of invoice.items) {
      if (!item.productId) {
        errors.push('Produsul sau serviciul este obligatoriu')
      }

      if (!Number.isInteger(item.quantity) ||
          item.quantity <= 0) {
        errors.push('Cantitatea trebuie sa fie un intreg pozitiv')
      }

      if (!isPositiveMoney(item.unitPrice)) {
        errors.push('Pretul unitar este invalid')
      }
    }
  }

  if (invoice.issueDate &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(invoice.issueDate) ||
       Number.isNaN(Date.parse(invoice.issueDate)))) {
    errors.push('Data emiterii este invalida')
  }

  return errors
}

// Calculeaza valorile financiare ale facturii.
// Preturile sunt in RON, iar cantitatile sunt intregi.
export function calculateInvoiceTotals(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Factura nu contine pozitii')
  }

  let subtotalCents = 0

  for (const item of items) {
    if (!Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        !isPositiveMoney(item.unitPrice)) {
      throw new Error('Pozitie de factura invalida')
    }

    const unitPriceCents = Math.round(item.unitPrice * 100)
    subtotalCents += unitPriceCents * item.quantity
  }

  const subtotal = subtotalCents / 100
  const vatAmount = roundMoney(subtotal * VAT_RATE)
  const total = roundMoney(subtotal + vatAmount)

  return {
    subtotal,
    vatAmount,
    total
  }
}

// Creeaza o factura pentru compania autentificata.
export async function createInvoice(invoice, user, supabase) {
  if (!user?.companyId || !supabase) {
    return failure('Autentificare necesara')
  }

  const validationErrors = validateInvoice(invoice)

  if (validationErrors.length > 0) {
    return {
      success: false,
      errors: validationErrors
    }
  }

  try {
    // 1. Verifica apartenenta clientului la companie.
    const { data: client, error: clientError } =
      await supabase
        .from('clients')
        .select('id, company_id')
        .eq('id', invoice.clientId)
        .eq('company_id', user.companyId)
        .maybeSingle()

    if (clientError || !client) {
      return failure('Clientul nu apartine companiei')
    }

    // 2. Verifica produsele companiei.
    const validatedItems = []

    for (const item of invoice.items) {
      const { data: product, error: productError } =
        await supabase
          .from('products')
          .select('id, company_id, name, type, unit_price')
          .eq('id', item.productId)
          .eq('company_id', user.companyId)
          .maybeSingle()

      if (productError || !product) {
        return failure(
          'Produsul sau serviciul nu apartine companiei'
        )
      }

      // Pretul este preluat din catalogul validat pe server.
      const unitPrice = Number(product.unit_price)

      if (!isPositiveMoney(unitPrice)) {
        return failure('Pretul produsului este invalid')
      }

      validatedItems.push({
        productId: product.id,
        description: String(product.name),
        quantity: item.quantity,
        unitPrice
      })
    }

    // 3. Calculeaza valorile pe server.
    const totals = calculateInvoiceTotals(validatedItems)

    // 4. Citeste ultimul numar de factura.
    const { data: latest, error: numberError } =
      await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('company_id', user.companyId)
        .order('invoice_number', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (numberError) {
      return failure('Nu s-a putut genera numarul facturii')
    }

    const nextNumber = (latest?.invoice_number || 0) + 1

    const newInvoice = {
      id: randomUUID(),
      company_id: user.companyId,
      client_id: client.id,
      invoice_number: nextNumber,
      issue_date:
        invoice.issueDate ||
        new Date().toISOString().slice(0, 10),
      subtotal: totals.subtotal,
      vat_amount: totals.vatAmount,
      total: totals.total
    }

    // 5. Salveaza antetul facturii.
    const { data: savedInvoice, error: invoiceError } =
      await supabase
        .from('invoices')
        .insert(newInvoice)
        .select()
        .single()

    if (invoiceError || !savedInvoice) {
      if (invoiceError?.code === '23505') {
        return failure(
          'Numarul facturii este deja utilizat. Reincearca.'
        )
      }

      return failure('Nu s-a putut salva factura')
    }

    // 6. Pregateste pozitiile facturii.
    const invoiceItems = validatedItems.map((item) => ({
      id: randomUUID(),
      invoice_id: savedInvoice.id,
      product_id: item.productId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: roundMoney(item.quantity * item.unitPrice)
    }))

    // 7. Salveaza pozitiile.
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems)

    if (itemsError) {
      // Compensare in caz de eroare la salvarea pozitiilor.
      // Nu echivaleaza cu o tranzactie SQL atomica.
      await supabase
        .from('invoices')
        .delete()
        .eq('id', savedInvoice.id)
        .eq('company_id', user.companyId)

      return failure('Nu s-au putut salva pozitiile facturii')
    }

    return {
      success: true,
      invoice: savedInvoice,
      items: invoiceItems
    }
  } catch {
    return failure('Nu s-a putut crea factura')
  }
}
