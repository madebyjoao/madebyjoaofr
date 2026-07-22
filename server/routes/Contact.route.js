import express from "express";
import ContactController from "../controllers/ContactController.js";
import CheckUploadToken from "../middlewares/CheckUploadToken.js";
import upload from "../middlewares/UploadMulter.js";

const contactRouter = express.Router();

contactRouter.post("/", ContactController.submit);

contactRouter.post(
  "/upload",
  CheckUploadToken,
  upload.single("sketch"),
  ContactController.upload
);

export default contactRouter;