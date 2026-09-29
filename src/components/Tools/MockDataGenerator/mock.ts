export type Field = 'name' | 'phone' | 'idcard' | 'email' | 'address' | 'company'
const surnames = [...'李王张刘陈杨黄赵吴周徐孙马朱胡郭何林罗高郑梁谢宋唐许韩冯邓曹彭曾田董潘袁蔡蒋余杜叶程苏魏吕丁任沈姚卢姜崔']
const given = [...'伟芳娜敏静丽强磊军洋勇艳杰娟涛明超霞平刚华建文宇欣怡佳琪晨浩子涵雨萱思远志国春生晓东鑫博俊雅铭轩瑞霖']
const areas = [
  ['110105', '北京市朝阳区', '北京'], ['310115', '上海市浦东新区', '上海'],
  ['320102', '江苏省南京市玄武区', '南京'], ['330106', '浙江省杭州市西湖区', '杭州'],
  ['440304', '广东省深圳市福田区', '深圳'], ['510104', '四川省成都市锦江区', '成都'],
]
const prefixes = ['130', '131', '132', '133', '135', '136', '137', '138', '139', '150', '151', '155', '156', '157', '158', '159', '166', '173', '176', '177', '180', '181', '186', '188', '189', '191', '195', '199']
const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
const checks = '10X98765432'
const random = (max: number) => crypto.getRandomValues(new Uint32Array(1))[0] % max
const pick = <T>(items: T[]) => items[random(items.length)]
const pad = (value: number, length: number) => String(value).padStart(length, '0')

function checksum(body: string): string {
  const sum = [...body].reduce((total, digit, index) => total + Number(digit) * weights[index], 0)
  return checks[sum % 11]
}

export function validateIdCard(value: string): { valid: boolean; message: string } {
  const text = value.trim().toUpperCase()
  if (!/^\d{17}[\dX]$/.test(text)) return { valid: false, message: '应为 18 位，末位可为 X' }
  const year = Number(text.slice(6, 10))
  const month = Number(text.slice(10, 12))
  const day = Number(text.slice(12, 14))
  const date = new Date(year, month - 1, day)
  if (year < 1900 || year > new Date().getFullYear() || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return { valid: false, message: '出生日期无效' }
  if (checksum(text.slice(0, 17)) !== text[17]) return { valid: false, message: '校验码不正确' }
  return { valid: true, message: '格式与校验码正确' }
}

function idCard(): string {
  const area = pick(areas)[0]
  const year = 1970 + random(37)
  const month = 1 + random(12)
  const day = 1 + random(new Date(year, month, 0).getDate())
  const body = area + year + pad(month, 2) + pad(day, 2) + pad(1 + random(998), 3)
  return body + checksum(body)
}

function generate(field: Field): string {
  if (field === 'name') return pick(surnames) + pick(given) + (random(5) ? pick(given) : '')
  if (field === 'phone') return pick(prefixes) + pad(random(100000000), 8)
  if (field === 'idcard') return idCard()
  if (field === 'email') return `demo${random(1000000)}@example.com`
  if (field === 'address') return `${pick(areas)[1]}人民路${1 + random(500)}号`
  return `${pick(areas)[2]}${pick(['星河', '云启', '博远', '联创'])}${pick(['科技', '网络', '咨询'])}有限公司`
}

export function generateRecords(fields: Field[], count: number): Record<string, string>[] {
  return Array.from({ length: count }, () => Object.fromEntries(fields.map(field => [field, generate(field)])))
}

export function recordsAsDelimited(records: Record<string, string>[], fields: Field[], delimiter: string): string {
  const cell = (value: string) => value.includes(delimiter) || /["\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
  return [fields.map(cell).join(delimiter), ...records.map(record => fields.map(field => cell(record[field])).join(delimiter))].join('\n')
}
