const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(n: number) { return String(n).padStart(2, '0'); }

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function today(): string {
  return toDateStr(new Date());
}

export function startOfMonth(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}

export function startOfWeek(d = new Date()): string {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // back to Monday
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return toDateStr(mon);
}

export function startOfYear(d = new Date()): string {
  return `${d.getFullYear()}-01-01`;
}

/** Start of the month N months before the current one. */
export function nMonthsAgo(n: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - (n - 1));
  return toDateStr(d);
}

export function formatDisplayDate(dateStr: string): string {
  const t = today();
  if (dateStr === t) return 'Today';
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (dateStr === toDateStr(yest)) return 'Yesterday';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
}

export function formatCurrency(amount: number): string {
  return '₹' + Math.abs(amount).toLocaleString('en-IN');
}

export { MONTH_LABELS };