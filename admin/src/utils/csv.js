/**
 * Client-side CSV export. No library, no backend round trip — the data is
 * already in the page.
 *
 * Generalised from the one-off `downloadCsv` that used to live in Reports.jsx so
 * ventas, movimientos de caja, inventario and movimientos de stock all export
 * the same way.
 */

function escapeCell(value) {
  if (value === null || value === undefined) return '""'
  return `"${String(value).replace(/"/g, '""')}"`
}

/**
 * @param {string[]} header
 * @param {Array<Array<string|number|null>>} rows
 * @param {string} filename - without extension; the date is appended
 */
export function downloadCsv(header, rows, filename) {
  const csv = [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n')
  // The BOM is what makes Excel on Windows read the accents (Categoría,
  // Devolución) as UTF-8 instead of mojibake.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/** Numbers go in unformatted so the spreadsheet can do maths on them. */
export function csvNumber(value) {
  return value === null || value === undefined ? '' : Number(value).toFixed(2)
}
