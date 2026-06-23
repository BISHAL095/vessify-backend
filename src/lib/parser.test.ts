import { describe, expect, it } from 'vitest'
import { parseTransaction } from './parser.js'

describe('parseTransaction', () => {
  it('parses date, amount, and description with high confidence', () => {
    const text = `Description: STARBUCKS CAFE\nAmount: -420.00\nDate: 11 Dec 2025`
    const result = parseTransaction(text)

    expect(result.description).toBe('STARBUCKS CAFE')
    expect(result.amount.toString()).toBe('-420')
    expect(result.date.getFullYear()).toBe(2025)
    expect(result.date.getMonth()).toBe(11) // December is month 11
    expect(result.date.getDate()).toBe(11)
    expect(result.confidence).toBe(1.0)
  })

  it('returns default values when fields are missing', () => {
    const text = 'No recognizable transaction data here'
    const result = parseTransaction(text)

    expect(result.description).toBe('Unknown transaction')
    expect(result.amount.toString()).toBe('0')
    expect(result.confidence).toBe(0.1)
  })

  it('parses formatted INR debit amounts and partial data', () => {
    const text = `SOME STORE NOTE\n12/11/2025\n₹1,250.00 debited`
    const result = parseTransaction(text)

    expect(result.amount.toString()).toBe('1250')
    expect(result.date.getFullYear()).toBe(2025)
    expect(result.date.getMonth()).toBe(11)
    expect(result.date.getDate()).toBe(11)
    expect(result.description).toBe('SOME STORE NOTE')
    expect(result.confidence).toBe(1.0)
  })
})
