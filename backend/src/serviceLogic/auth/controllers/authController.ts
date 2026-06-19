import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/asyncHandler";
import * as authService from "../services/auth.service";
import { resetConfirmSchema } from "../models/auth.schema";
import { signupSchema } from "../models/auth.schema";
import { loginSchema } from "../models/auth.schema";
import { resetRequestSchema } from "../models/auth.schema";

export const confirmPasswordResetController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = resetConfirmSchema.parse(req.body);
    const result = await authService.confirmPasswordReset(
      body.token,
      body.newPassword,
    );
    res.json(result);
  },
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.password);
    res.json(result);
  },
);

export const requestPasswordResetController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = resetRequestSchema.parse(req.body);
    const result = await authService.requestPasswordReset(body.email);
    res.json(result);
  },
);

export const signupController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = signupSchema.parse(req.body);
    const result = await authService.signup(
      body.email,
      body.password,
      body.displayName,
    );
    res.status(201).json(result);
  },
);
