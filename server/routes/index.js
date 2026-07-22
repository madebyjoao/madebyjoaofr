import express from "express";
import contactRouter from "./Contact.route.js";

const router = express.Router();

router.use("/api/contact", contactRouter);

export default router;