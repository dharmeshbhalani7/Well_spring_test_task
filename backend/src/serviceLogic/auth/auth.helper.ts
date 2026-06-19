import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { JwtPayload, SanitizedCreator } from "./models/auth.types";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(creatorId: string, email: string): string {
  const payload: JwtPayload = { sub: creatorId, email };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function sanitizeCreator(creator: {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}): SanitizedCreator {
  return {
    id: creator.id,
    email: creator.email,
    displayName: creator.displayName,
    createdAt: creator.createdAt,
  };
}
