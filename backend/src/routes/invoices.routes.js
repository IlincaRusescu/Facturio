import { Router } from 'express'

import { createSupabaseClient } from '../config/supabase.js'
import { createRequireAuth } from '../middleware/auth.middleware.js'
import { createInvoice } from '../services/invoices.service.js'

import {
  exportInvoicePdf
} from '../services/invoice-pdf.service.js'

const router = Router()
const authSupabase = createSupabaseClient()

router.use(createRequireAuth(authSupabase))

function userSupabase(req) {
  const token = req.headers.authorization?.replace(
    /^Bearer\s+/i,
    ''
  )

  return createSupabaseClient(token)
}

// Incarca datele necesare formularului de facturare.
router.get('/context', async (req, res) => {
  if (!req.user?.companyId) {
    return res.status(401).json({
      success: false,
      errors: ['Autentificare necesara']
    })
  }

  const supabase = userSupabase(req)
  const companyId = req.user.companyId

  try {
    const [companyResult, clientsResult, productsResult] =
      await Promise.all([
        supabase
          .from('companies')
          .select('id, name, cui, address, email, invoice_prefix')
          .eq('id', companyId)
          .single(),

        supabase
          .from('clients')
          .select('id, name, cui, address, email')
          .eq('company_id', companyId)
          .order('name'),

        supabase
          .from('products')
          .select('id, name, type, unit_price')
          .eq('company_id', companyId)
          .order('name')
      ])

    if (
      companyResult.error ||
      clientsResult.error ||
      productsResult.error
    ) {
      return res.status(500).json({
        success: false,
        errors: ['Nu s-au putut incarca datele de facturare']
      })
    }

    return res.json({
      success: true,
      company: companyResult.data,
      clients: clientsResult.data || [],
      products: productsResult.data || []
    })
  } catch {
    return res.status(500).json({
      success: false,
      errors: ['Eroare la incarcarea datelor']
    })
  }
})


 // Lista facturilor salvate pentru compania autentificata
router.get('/', async (req, res) => {
  if (!req.user?.companyId) {
    return res.status(401).json({
      success: false,
      errors: ['Autentificare necesara']
    })
  }

  try {
    const supabase = userSupabase(req)
    const companyId = req.user.companyId

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(
        'id, company_id, client_id, invoice_number, issue_date, subtotal, vat_amount, total'
      )
      .eq('company_id', companyId)
      .order('invoice_number', { ascending: false })

    if (error) {
      return res.status(500).json({
        success: false,
        errors: ['Nu s-au putut incarca facturile']
      })
    }

    return res.json({
      success: true,
      invoices: invoices || []
    })
  } catch {
    return res.status(500).json({
      success: false,
      errors: ['Eroare la incarcarea facturilor']
    })
  }
})

// Vizualizarea unei facturi salvate, fara editare
router.get('/:id', async (req, res) => {
  if (!req.user?.companyId) {
    return res.status(401).json({
      success: false,
      errors: ['Autentificare necesara']
    })
  }

  try {
    const supabase = userSupabase(req)
    const companyId = req.user.companyId

    const { data: invoice, error: invoiceError } =
      await supabase
        .from('invoices')
        .select(
          'id, company_id, client_id, invoice_number, issue_date, subtotal, vat_amount, total'
        )
        .eq('id', req.params.id)
        .eq('company_id', companyId)
        .maybeSingle()

    if (invoiceError) {
      return res.status(500).json({
        success: false,
        errors: ['Nu s-a putut incarca factura']
      })
    }

    if (!invoice) {
      return res.status(404).json({
        success: false,
        errors: ['Factura nu a fost gasita']
      })
    }

    const [itemsResult, clientResult, companyResult] =
      await Promise.all([
        supabase
          .from('invoice_items')
          .select(
            'id, invoice_id, product_id, description, quantity, unit_price, line_total'
          )
          .eq('invoice_id', invoice.id),

        supabase
          .from('clients')
          .select('id, name, cui, address, email')
          .eq('id', invoice.client_id)
          .eq('company_id', companyId)
          .maybeSingle(),

        supabase
          .from('companies')
          .select('id, name, cui, address, email, invoice_prefix')
          .eq('id', companyId)
          .maybeSingle()
      ])

    if (
      itemsResult.error ||
      clientResult.error ||
      companyResult.error
    ) {
      return res.status(500).json({
        success: false,
        errors: ['Nu s-au putut incarca detaliile facturii']
      })
    }

    return res.json({
      success: true,
      invoice,
      items: itemsResult.data || [],
      client: clientResult.data || null,
      company: companyResult.data || null
    })
  } catch {
    return res.status(500).json({
      success: false,
      errors: ['Eroare la vizualizarea facturii']
    })
  }
})


// Creeaza si salveaza factura.
router.post('/', async (req, res) => {
  if (!req.user?.companyId) {
    return res.status(401).json({
      success: false,
      errors: ['Autentificare necesara']
    })
  }

  const result = await createInvoice(
    req.body,
    req.user,
    userSupabase(req)
  )

  if (!result.success) {
    return res.status(400).json(result)
  }

  return res.status(201).json(result)
})


// Descarca PDF-ul unei facturi salvate.
// Ruta este protejata de middleware-ul de autentificare.
router.get('/:id/pdf', async (req, res) => {
  if (!req.user?.companyId) {
    return res.status(401).json({
      success: false,
      errors: ['Autentificare necesara']
    })
  }

  const result = await exportInvoicePdf(
    req.params.id,
    req.user,
    userSupabase(req)
  )

  if (!result.success) {
    const notFound = result.errors?.includes(
      'Factura nu a fost gasita'
    )

    return res.status(notFound ? 404 : 400).json(result)
  }

  res.setHeader('Content-Type', 'application/pdf')

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${result.filename}"`
  )

  res.setHeader(
    'Access-Control-Expose-Headers',
    'Content-Disposition'
  )

  res.setHeader('Content-Length', result.buffer.length)

  return res.status(200).send(result.buffer)
})


export default router
