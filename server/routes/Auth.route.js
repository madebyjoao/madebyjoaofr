import express from "express";
import rateLimit from "express-rate-limit";
import AuthController from "../controllers/AuthController.js";

const authRouter = express.Router();


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives. Réessayez plus tard." },
});

authRouter.post("/login", loginLimiter, AuthController.login);

export default authRouter;