import express from "express";
import AdminController from "../../controllers/AdminController.js";
import upload from "../../middlewares/UploadMulter.js";


const adminContactRouter = express.Router();

adminContactRouter.get("/", AdminController.listRequests);
adminContactRouter.get("/:id", AdminController.getRequest);
adminContactRouter.patch("/:id", AdminController.updateRequest);
adminContactRouter.post("/:id/images", upload.single("sketch"), AdminController.addImage);
adminContactRouter.delete("/:id/images/:imageId", AdminController.deleteImage);

export default adminContactRouter;