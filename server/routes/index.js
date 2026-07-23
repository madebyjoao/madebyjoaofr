import express from "express";
import contactRouter from "./Contact.route.js";
import authRouter from "./Auth.route.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import adminContactRouter from "./admin/Contact.route.js";
import projectRouter from "./Project.route.js";

const router = express.Router();

router.use("/api/contact", contactRouter);
router.use("/api/auth", authRouter);
router.use("/api/projects", projectRouter);

// Dashboard Routes

router.get("/api/admin/ping", AuthMiddleware, (req, res) =>
  res.json({ ok: true, message: "vous êtes admin", email: req.admin.email })
);

router.use("/api/admin/requests", AuthMiddleware, adminContactRouter);

export default router;