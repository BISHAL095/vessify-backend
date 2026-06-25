import { Prisma } from '@prisma/client'

type ParsedTransaction = {
  description: string
  amount: Prisma.Decimal   
  date: Date
  confidence: number
}

// Each pattern targets a specific sample format
// Order matters — more specific patterns come first to avoid false matches
const DATE_PATTERNS = [
  /Date:\s*(\d{1,2}\s+\w+\s+\d{4})/i,    // Sample 1: "Date: 11 Dec 2025"
  /(\d{2}\/\d{2}\/\d{4})/,               // Sample 2: "12/11/2025"
  /(\d{4}-\d{2}-\d{2})/,                 // Sample 3: "2025-12-10" ISO
]

const AMOUNT_PATTERNS = [
  /Amount:\s*([+-]?[\d,]+\.?\d*)/i,      // Sample 1: "Amount: -420.00"
  /₹([\d,]+\.?\d*)\s+debited/i,          // Sample 2: "₹1,250.00 debited"
  /₹([\d,]+\.?\d*)\s+Dr/i,               // Sample 3: "₹2,999.00 Dr"
]

const DESC_PATTERNS = [
  /Description:\s*(.+)/i,                                   // Sample 1: "Description: STARBUCKS..."
  /^((?!\d{1,2}\/\d{1,2}\/\d{4}).+?)\n.*?(?:debited|Dr)/im, // Sample 2: description before debit line
  /(?:txn\S+\s+\S+\s+)(.+?)\s+₹/i,                          // Sample 3: text between date and ₹ symbol
]

function parseDate(text: string): { value: Date; found: boolean } {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern)
    if (match?.[1]) {
        const parsed = new Date(match[1])
        if (!isNaN(parsed.getTime())) return { value: parsed, found: true }
    }
  }
  // Fallback to today so the DB insert never fails — confidence reflects this
  return { value: new Date(), found: false }
}

function parseAmount(text: string): { value: Prisma.Decimal; found: boolean } {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern)

    if (match?.[1]) {
        const cleaned = match[1].replace(/,/g, '')
        return { value: new Prisma.Decimal(cleaned), found: true }
    }
  }
  return { value: new Prisma.Decimal(0), found: false }
}

function isLikelyDate(line: string): boolean {
  return DATE_PATTERNS.some((pattern) => pattern.test(line))
}

function isLikelyAmount(line: string): boolean {
  return AMOUNT_PATTERNS.some((pattern) => pattern.test(line))
}

function parseDescription(
  text: string,
  allowFallback = false,
): { value: string; found: boolean } {
  for (const pattern of DESC_PATTERNS) {
    const match = text.match(pattern)

    if (match?.[1]) {
      return { value: match[1].trim(), found: true }
    }
  }

  if (!allowFallback)
    return { value: 'Unknown transaction', found: false }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    if (!isLikelyDate(line) && !isLikelyAmount(line)) {
      return { value: line, found: true }
    }
  }

  return { value: 'Unknown transaction', found: false }
}

function calculateConfidence(fieldsFound: number): number {
  // Each field contributes equally — 3 fields = high confidence, fewer = degraded
  const scores: Record<number, number> = { 3: 1.0, 2: 0.7, 1: 0.4, 0: 0.1 }
  return scores[fieldsFound] ?? 0.1
}

// Pure function — no DB calls, no side effects
// Same input always returns same output, making it trivial to unit test
export function parseTransaction(text: string): ParsedTransaction {
  const date = parseDate(text)
  const amount = parseAmount(text)
  const description = parseDescription(text, date.found || amount.found)

  const fieldsFound = [date.found, amount.found, description.found]
    .filter(Boolean).length

  return {
    description: description.value,
    amount: amount.value,
    date: date.value,
    confidence: calculateConfidence(fieldsFound),
  }
}