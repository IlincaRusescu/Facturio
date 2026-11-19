// T-03.1 – RED: Teste pentru adaugarea clientilor

import { describe, it, expect, vi } from 'vitest'

import {
  createClient
} from '../src/services/clients.service.js'

import {
  createClientValidator
} from '../src/validators/client.validator.js'

import {
  createRequireAuth
} from '../src/middleware/auth.middleware.js'

describe('US-03 - Adaugare client', () => {
  const validClient = {
    name: 'SC Exemplu SRL',
    cui: 'RO12345678',
    address: 'Bucuresti, Str. Exemplu nr. 10',
    email: 'contact@exemplu.ro'
  }

  const authenticatedUser = {
    id: 'user-123',
    companyId: 'company-A'
  }

  it('respinge clientul fara date obligatorii', () => {
    const result = createClientValidator({
      name: '',
      cui: '',
      address: '',
      email: ''
    })

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('respinge clientul cu email invalid', () => {
    const result = createClientValidator({
      ...validClient,
      email: 'email-invalid'
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Adresa de email este invalida'
    )
  })

  it('respinge CUI-ul duplicat in aceeasi companie', async () => {
    const insert = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: '23505',
        message: 'Duplicate key'
      }
    })

    const supabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: insert
          })
        })
      })
    }

    const result = await createClient(
      validClient,
      authenticatedUser,
      supabase
    )

    expect(result.success).toBe(false)
    expect(result.errors).toContain(
      'Exista deja un client cu acest CUI in companie'
    )
  })

  it('asociaza clientul cu firma utilizatorului autentificat', async () => {
    const savedClient = {
      id: 'client-123',
      ...validClient,
      company_id: 'company-A'
    }

    const single = vi.fn().mockResolvedValue({
      data: savedClient,
      error: null
    })

    const insert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single
      })
    })

    const supabase = {
      from: vi.fn().mockReturnValue({
        insert
      })
    }

    const result = await createClient(
      {
        ...validClient,
        company_id: 'company-B'
      },
      authenticatedUser,
      supabase
    )

    expect(result.success).toBe(true)
    expect(result.client.company_id).toBe('company-A')

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: 'company-A'
      })
    )
  })

  it('respinge operatiile neautorizate', async () => {
    const supabase = {
      auth: {
        getUser: vi.fn()
      }
    }

    const req = {
      headers: {}
    }

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }

    const next = vi.fn()

    await createRequireAuth(supabase)(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
    expect(supabase.auth.getUser)
      .not.toHaveBeenCalled()
  })
})
