import { describe, it, expect, vi } from 'vitest'

import {
  updateClient
} from '../src/services/clients.service.js'

// T-04.1 - RED: Teste pentru actualizarea clientilor

describe('US-04 - Actualizare date client', () => {
  const authenticatedUser = {
    id: 'user-123',
    companyId: 'company-A'
  }

  const clientId = 'client-123'

  const validClient = {
    name: 'SC Exemplu Actualizat SRL',
    cui: 'RO12345678',
    address: 'Bucuresti, Str. Noua nr. 20',
    email: 'office@exemplu.ro'
  }

  // Simuleaza interogarea Supabase pentru UPDATE
  function mockUpdateQuery(data, error = null) {
    const maybeSingle = vi.fn().mockResolvedValue({
      data,
      error
    })

    const select = vi.fn().mockReturnValue({
      maybeSingle
    })

    const eqCompany = vi.fn().mockReturnValue({
      select
    })

    const eqId = vi.fn().mockReturnValue({
      eq: eqCompany
    })

    const update = vi.fn().mockReturnValue({
      eq: eqId
    })

    const supabase = {
      from: vi.fn().mockReturnValue({
        update
      })
    }

    return {
      supabase,
      update,
      eqId,
      eqCompany,
      select,
      maybeSingle
    }
  }

  it('actualizeaza datele unui client existent', async () => {
    const savedClient = {
      id: clientId,
      company_id: 'company-A',
      ...validClient
    }

    const { supabase, update, eqId, eqCompany } =
      mockUpdateQuery(savedClient)

    const result = await updateClient(
      clientId,
      validClient,
      authenticatedUser,
      supabase
    )

    expect(result.success).toBe(true)
    expect(result.client).toEqual(savedClient)

    expect(supabase.from)
      .toHaveBeenCalledWith('clients')

    expect(update).toHaveBeenCalledWith({
      name: validClient.name,
      cui: validClient.cui,
      address: validClient.address,
      email: validClient.email
    })

    expect(eqId)
      .toHaveBeenCalledWith('id', clientId)

    expect(eqCompany)
      .toHaveBeenCalledWith('company_id', 'company-A')
  })

  it('respinge actualizarea cu date invalide', async () => {
    const { supabase, update } =
      mockUpdateQuery(null)

    const result = await updateClient(
      clientId,
      {
        ...validClient,
        email: 'email-invalid'
      },
      authenticatedUser,
      supabase
    )

    expect(result.success).toBe(false)

    expect(result.errors).toContain(
      'Adresa de email este invalida'
    )

    expect(update).not.toHaveBeenCalled()
  })

  it('respinge CUI-ul duplicat in aceeasi companie', async () => {
    const { supabase } = mockUpdateQuery(null, {
      code: '23505',
      message: 'Duplicate key'
    })

    const result = await updateClient(
      clientId,
      {
        ...validClient,
        cui: 'RO87654321'
      },
      authenticatedUser,
      supabase
    )

    expect(result.success).toBe(false)

    expect(result.errors).toContain(
      'Exista deja un client cu acest CUI in companie'
    )
  })

  it('blocheaza actualizarea clientului altei companii', async () => {
    // Clientul nu este returnat pentru compania A
    const {
      supabase,
      eqId,
      eqCompany
    } = mockUpdateQuery(null)

    const result = await updateClient(
      'client-company-B',
      validClient,
      authenticatedUser,
      supabase
    )

    expect(result.success).toBe(false)

    expect(result.errors).toContain(
      'Clientul nu a fost gasit'
    )

    // Actualizarea trebuie limitata la compania autentificata
    expect(eqId).toHaveBeenCalledWith(
      'id',
      'client-company-B'
    )

    expect(eqCompany).toHaveBeenCalledWith(
      'company_id',
      'company-A'
    )
  })
})
