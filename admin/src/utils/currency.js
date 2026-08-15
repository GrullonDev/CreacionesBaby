const formatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
})

export function formatCurrency(amount) {
  return formatter.format(amount)
}
