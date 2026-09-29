type Bracket = { limit: number; rate: number; quick: number }
// 国家税务总局：居民工资薪金累计预扣率表一。
const annual: Bracket[] = [
  { limit: 36000, rate: .03, quick: 0 }, { limit: 144000, rate: .1, quick: 2520 },
  { limit: 300000, rate: .2, quick: 16920 }, { limit: 420000, rate: .25, quick: 31920 },
  { limit: 660000, rate: .3, quick: 52920 }, { limit: 960000, rate: .35, quick: 85920 },
  { limit: Infinity, rate: .45, quick: 181920 },
]
// 财政部、税务总局公告 2023 年第 30 号附件：全年一次性奖金月换算税率表。
const monthly: Bracket[] = [
  { limit: 3000, rate: .03, quick: 0 }, { limit: 12000, rate: .1, quick: 210 },
  { limit: 25000, rate: .2, quick: 1410 }, { limit: 35000, rate: .25, quick: 2660 },
  { limit: 55000, rate: .3, quick: 4410 }, { limit: 80000, rate: .35, quick: 7160 },
  { limit: Infinity, rate: .45, quick: 15160 },
]
function tax(amount: number, brackets: Bracket[]): number {
  if (amount <= 0) return 0
  const bracket = brackets.find(item => amount <= item.limit)!
  return Math.max(0, amount * bracket.rate - bracket.quick)
}
export type SalaryRow = { month: number; taxable: number; monthTax: number; net: number; cumulativeTax: number }
export function salarySchedule(gross: number, social: number, additional: number, other: number): SalaryRow[] {
  if (![gross, social, additional, other].every(Number.isFinite) || gross < 0 || social < 0 || additional < 0 || other < 0) throw new Error('金额应为非负数')
  const rows: SalaryRow[] = []
  let paid = 0
  for (let month = 1; month <= 12; month++) {
    const taxable = Math.max(0, month * (gross - social - additional - other - 5000))
    const due = tax(taxable, annual)
    const monthTax = Math.max(0, due - paid)
    paid += monthTax
    rows.push({ month, taxable, monthTax, net: gross - social - monthTax, cumulativeTax: paid })
  }
  return rows
}
export function bonusTax(bonus: number): number {
  if (!Number.isFinite(bonus) || bonus < 0) throw new Error('奖金应为非负数')
  if (!bonus) return 0
  const bracket = monthly.find(item => bonus / 12 <= item.limit)!
  return Math.max(0, bonus * bracket.rate - bracket.quick)
}
export function annualIncomeTax(taxable: number): number { return tax(taxable, annual) }
