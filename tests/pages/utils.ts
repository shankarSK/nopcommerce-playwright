/** Parses a currency string like "$27.00", "Ground ($0.00)", or "FREE" into a number. */
export function parseCurrencyText(text: string): number {
  if (/free/i.test(text)) return 0;
  const match = text.match(/([\d,]+\.[\d]{2})/);
  return match ? parseFloat(match[1].replace(',', '')) : 0;
}
