//T-02.1 – RED: Teste pentru autentificare

import { describe, it, expect, vi } from 'vitest'

import { loginUser } from '../src/services/login.service.js'

import {
  createRequireAuth,
  requireCompanyAccess
} from '../src/middleware/auth.middleware.js'

describe('US-02 - Autentificare utilizator', () => {
  const credentials = {
    email: 'ana@example.com',
    password: 'Test123!'
  }

  it('permite autentificarea cu date corecte', async () => {
    const supabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'user-123' },
            session: {
              access_token: 'token-valid'
            }
          },
          error: null
        })
      }
    }

    const result = await loginUser(credentials, supabase)

    expect(result.success).toBe(true)
    expect(result.user.id).toBe('user-123')
    expect(result.session.access_token).toBe('token-valid')

    expect(supabase.auth.signInWithPassword)
      .toHaveBeenCalledWith(credentials)
  })

  it('respinge autentificarea cu parola gresita', async () => {
    const supabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: null,
            session: null
          },
          error: {
            message: 'Invalid login credentials'
          }
        })
      }
    }

    const result = await loginUser(
      { ...credentials, password: 'ParolaGresita' },
      supabase
    )

    expect(result.success).toBe(false)
    expect(result.errors)
      .toContain('Invalid login credentials')
  })

  it('blocheaza accesul la endpoint fara sesiune valida', async () => {
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: {
            message: 'Invalid token'
          }
        })
      }
    }

    const req = {
      headers: {
        authorization: 'Bearer token-expirat'
      }
    }

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }

    const next = vi.fn()

    await createRequireAuth(supabase)(req, res, next)

    expect(supabase.auth.getUser)
      .toHaveBeenCalledWith('token-expirat')

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('blocheaza accesul la datele altei companii', () => {
    const req = {
      user: {
        id: 'user-123',
        companyId: 'company-A'
      },
      params: {
        companyId: 'company-B'
      }
    }

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }

    const next = vi.fn()

    requireCompanyAccess(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })
})
