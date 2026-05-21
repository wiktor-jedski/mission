export type AdminPasswordVerification =
  | { status: "valid" }
  | { status: "invalid" }
  | { status: "missing_configuration" };

export const verifyAdminPassword = (
  candidate: string,
  configuredPassword = process.env.ADMIN_PASSWORD
): AdminPasswordVerification => {
  const expected = configuredPassword?.trim();

  if (!expected) {
    return { status: "missing_configuration" };
  }

  return constantTimeEqual(candidate, expected)
    ? { status: "valid" }
    : { status: "invalid" };
};

const constantTimeEqual = (candidate: string, expected: string): boolean => {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  const length = Math.max(candidateBuffer.length, expectedBuffer.length);
  let difference = candidateBuffer.length ^ expectedBuffer.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (candidateBuffer[index] ?? 0) ^ (expectedBuffer[index] ?? 0);
  }

  return difference === 0;
};
