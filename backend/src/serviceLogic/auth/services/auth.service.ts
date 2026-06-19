import { createHash, randomBytes } from "crypto";
import { env } from "../../../config/env";
import { withoutTenantContext } from "../../../db/client";
import { badRequest, conflict } from "../../../shared/errors";
import { logger } from "../../../shared/logger";
import {
  hashPassword,
  sanitizeCreator,
  signToken,
  verifyPassword,
} from "../auth.helper";

export async function signup(
  email: string,
  password: string,
  displayName: string,
) {
  return withoutTenantContext(async (tx) => {
    const existing = await tx.creator.findUnique({ where: { email } });
    if (existing) {
      throw conflict("Email already registered");
    }

    const passwordHash = await hashPassword(password);
    const creator = await tx.creator.create({
      data: { email, passwordHash, displayName },
    });

    const token = signToken(creator.id, creator.email);
    return { creator: sanitizeCreator(creator), token };
  });
}

export async function login(email: string, password: string) {
  return withoutTenantContext(async (tx) => {
    const creator = await tx.creator.findUnique({ where: { email } });
    if (!creator) {
      throw badRequest("Invalid email or password");
    }

    const valid = await verifyPassword(password, creator.passwordHash);
    if (!valid) {
      throw badRequest("Invalid email or password");
    }

    const token = signToken(creator.id, creator.email);
    return { creator: sanitizeCreator(creator), token };
  });
}

export async function requestPasswordReset(email: string) {
  return withoutTenantContext(async (tx) => {
    const creator = await tx.creator.findUnique({ where: { email } });
    if (!creator) {
      return { message: "If the email exists, a reset link has been sent" };
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await tx.passwordResetToken.create({
      data: { creatorId: creator.id, tokenHash, expiresAt },
    });

    const resetUrl = `${env.APP_URL}/reset-password?token=${rawToken}`;
    logger.info(
      { tenant_id: creator.id, email: creator.email, resetUrl },
      "Password reset token generated (dev: logged to console)",
    );

    return { message: "If the email exists, a reset link has been sent" };
  });
}

export async function confirmPasswordReset(token: string, newPassword: string) {
  return withoutTenantContext(async (tx) => {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const resetToken = await tx.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw badRequest("Invalid or expired reset token");
    }

    const passwordHash = await hashPassword(newPassword);

    await tx.creator.update({
      where: { id: resetToken.creatorId },
      data: { passwordHash },
    });

    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    return { message: "Password updated successfully" };
  });
}
