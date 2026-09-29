export type RepayMethod = 'annuity' | 'equalPrincipal'
export type Prepayment = { afterMonths: number; amount: number; strategy: 'shorten' | 'reducePayment' }
export type LoanRow = { month: number; payment: number; principal: number; interest: number; remaining: number; extra: number }

export function monthlyPayment(principal: number, rate: number, months: number): number {
  if (months <= 0) return 0
  if (rate === 0) return principal / months
  const factor = Math.pow(1 + rate, months)
  return principal * rate * factor / (factor - 1)
}

export function loanSchedule(principal: number, annualRate: number, months: number, method: RepayMethod, prepayment?: Prepayment): LoanRow[] {
  if (!Number.isFinite(principal) || !Number.isFinite(annualRate) || !Number.isInteger(months) || principal <= 0 || annualRate < 0 || annualRate > 100 || months < 1 || months > 1200) throw new Error('请输入有效的贷款金额、年利率与期限')
  if (prepayment && (!Number.isInteger(prepayment.afterMonths) || prepayment.afterMonths < 1 || prepayment.afterMonths >= months || !Number.isFinite(prepayment.amount) || prepayment.amount <= 0)) throw new Error('请填写有效的提前还款时间和金额')
  const rate = annualRate / 1200
  const rows: LoanRow[] = []
  let remaining = principal
  let regularAnnuity = monthlyPayment(principal, rate, months)
  let regularPrincipal = principal / months
  for (let month = 1; month <= months && remaining > 0.000001; month++) {
    const interest = remaining * rate
    const principalPart = Math.min(remaining, method === 'annuity' ? Math.max(0, regularAnnuity - interest) : regularPrincipal)
    remaining -= principalPart
    let extra = 0
    if (prepayment && month === prepayment.afterMonths) {
      extra = Math.min(remaining, prepayment.amount)
      remaining -= extra
      if (prepayment.strategy === 'reducePayment' && remaining > 0) {
        regularAnnuity = monthlyPayment(remaining, rate, months - month)
        regularPrincipal = remaining / (months - month)
      }
    }
    if (remaining < 0.000001) remaining = 0
    rows.push({ month, payment: principalPart + interest + extra, principal: principalPart, interest, remaining, extra })
  }
  return rows
}

export function loanSummary(rows: LoanRow[]) {
  return { months: rows.length, interest: rows.reduce((sum, row) => sum + row.interest, 0), total: rows.reduce((sum, row) => sum + row.payment, 0) }
}
