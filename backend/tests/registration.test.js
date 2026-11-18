import { describe, it, expect } from 'vitest'
import { validateRegistration } from '../src/validators/registration.validator.js'

describe('US-01 - Validare inregistrare utilizator', () => {
  const validRegistration = {
    firstName: 'Ana',
    lastName: 'Popescu',
    email: 'ana@example.com',
    password: 'Test123!',
    companyId: '550e8400-e29b-41d4-a716-446655440000'
  }

  it('respinge inregistrarea daca prenumele este gol', () => {
    const result = validateRegistration({
      ...validRegistration,
      firstName: ''
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Prenumele este obligatoriu')
  })

  it('respinge inregistrarea daca prenumele contine doar spatii', () => {
    const result = validateRegistration({
      ...validRegistration,
      firstName: '   '
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Prenumele este obligatoriu')
  })

  it('respinge inregistrarea daca numele este gol', () => {
    const result = validateRegistration({
      ...validRegistration,
      lastName: ''
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Numele este obligatoriu')
  })

  it('respinge inregistrarea daca emailul este gol', () => {
    const result = validateRegistration({
      ...validRegistration,
      email: ''
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Adresa de email este obligatorie')
  })

  it('respinge inregistrarea daca emailul este invalid', () => {
    const result = validateRegistration({
      ...validRegistration,
      email: 'email-invalid'
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Adresa de email este invalida')
  })

  it('respinge inregistrarea daca parola este prea scurta', () => {
    const result = validateRegistration({
      ...validRegistration,
      password: '123'
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Parola trebuie sa aiba minimum 8 caractere'
    )
  })

  it('respinge inregistrarea daca parola este goala', () => {
    const result = validateRegistration({
      ...validRegistration,
      password: ''
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Parola este obligatorie')
  })

  it('respinge inregistrarea daca nu este selectata compania', () => {
    const result = validateRegistration({
      ...validRegistration,
      companyId: ''
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Selectarea companiei este obligatorie'
    )
  })

  it('respinge inregistrarea daca ID-ul companiei este invalid', () => {
    const result = validateRegistration({
      ...validRegistration,
      companyId: 'invalid-company-id'
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Identificatorul companiei este invalid'
    )
  })

  it('accepta datele valide de inregistrare', () => {
    const result = validateRegistration(validRegistration)

    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })
})
