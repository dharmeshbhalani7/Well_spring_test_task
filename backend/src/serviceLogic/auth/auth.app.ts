import { Router } from "express";
import { authRouter } from "./auth.router";

export const authApp = Router();
authApp.use(authRouter);
