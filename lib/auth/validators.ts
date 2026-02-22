export function validatePasscode(passcode: string) {
  const expected = process.env.APP_PASSCODE;
  if (!expected) throw new Error("Missing APP_PASSCODE env var");
  return passcode === expected;
}
