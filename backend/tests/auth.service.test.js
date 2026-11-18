import { describe, it, expect, vi } from 'vitest'
import { registerUser } from '../src/services/auth.service.js'

describe('US-01 - Serviciu inregistrare utilizator', () => {
  const validData = {
    firstName: 'Ana',
    lastName: 'Popescu',
    email: 'ana@example.com',
    password: 'Test123!',
    companyId: '550e8400-e29b-41d4-a716-446655440000'
  }

  it('respinge datele invalide fara a apela Supabase', async () => {
    const supabase = {
      auth: {
        signUp: vi.fn()
      },
      rpc: vi.fn()
    }

    const result = await registerUser(
      { ...validData, firstName: '' },
      supabase
    )

    expect(result.success).toBe(false)
    expect(result.errors).toContain('Prenumele este obligatoriu')
    expect(supabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('creeaza contul si profilul asociat companiei', async () => {
    const supabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'user-123' },
            session: { access_token: 'test-token' }
          },
          error: null
        })
      },
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: null
      })
    }

    const result = await registerUser(validData, supabase)

    expect(result.success).toBe(true)

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: validData.email,
      password: validData.password
    })

    expect(supabase.rpc).toHaveBeenCalledWith(
      'register_profile',
      {
        p_first_name: validData.firstName,
        p_last_name: validData.lastName,
        p_company_id: validData.companyId
      }
    )
  })

  it('gestioneaza eroarea Supabase Auth', async () => {
    const supabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'User already registered' }
        })
      },
      rpc: vi.fn()
    }

    const result = await registerUser(validData, supabase)

    expect(result.success).toBe(false)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('respinge inregistrarea daca asocierea profilului esueaza', async () => {
    const supabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'user-123' },
            session: { access_token: 'test-token' }
          },
          error: null
        })
      },
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Invalid company' }
      })
    }

    const result = await registerUser(validData, supabase)

    expect(result.success).toBe(false)
    expect(result.errors).toContain('Invalid company')
  })
})
