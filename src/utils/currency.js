const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export const formatCurrency = (amount) => {
  const numeric = Number(amount)
  if (!Number.isFinite(numeric)) return USD_FORMATTER.format(0)
  return USD_FORMATTER.format(numeric)
}
