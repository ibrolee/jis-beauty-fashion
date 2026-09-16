import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/** Passwords are only ever stored as bcrypt hashes. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
