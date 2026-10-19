export function getAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) {
    return null
  }

  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  // dateOfBirth has no time, so it parses as UTC midnight; reading it back in UTC keeps the
  // calendar day intact, while "today" must stay local — it's the user's calendar day.
  let age = today.getFullYear() - birthDate.getUTCFullYear()
  const monthDiff = today.getMonth() - birthDate.getUTCMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getUTCDate())) {
    age--
  }
  return age
}
