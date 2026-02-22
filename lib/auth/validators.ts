export function isAuthEnabled() {
  return Boolean(process.env.APP_PASSCODE);
}

export function validatePasscode(passcode: string) {
  const expected = process.env.APP_PASSCODE;

  // If no passcode is configured, auth is disabled (useful for initial testing).
  if (!expected) return true;

  return passcode === expected;
}
