import express from "express";
import AdminProjectController from "../../controllers/AdminProjectController.js";
import upload from "../../middlewares/UploadMulter.js";

const adminProjectRouter = express.Router();

adminProjectRouter.get("/", AdminProjectController.list);
adminProjectRouter.post("/", AdminProjectController.create);
adminProjectRouter.get("/:id", AdminProjectController.get);
adminProjectRouter.patch("/:id", AdminProjectController.update);

adminProjectRouter.post("/:id/images", upload.single("image"), AdminProjectController.addImage);
adminProjectRouter.patch("/:id/images/order", AdminProjectController.reorderImages);
adminProjectRouter.delete("/:id/images/:imageId", AdminProjectController.deleteImage);

export default adminProjectRouter;