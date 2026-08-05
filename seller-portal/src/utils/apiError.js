// Backend validation errors come back as Zod's `error.flatten()` shape:
// { formErrors: string[], fieldErrors: { [field]: string[] } }. Plain errors
// (auth, ownership, not-found) come back as { error: 'message string' }.
export function extractApiError(err, fallback) {
  const payload = err.response?.data?.error
  if (typeof payload === 'string') return payload
  if (payload?.formErrors?.length) return payload.formErrors[0]
  if (payload?.fieldErrors) {
    const firstField = Object.values(payload.fieldErrors).find((msgs) => msgs?.length)
    if (firstField) return firstField[0]
  }
  return err.message || fallback
}
