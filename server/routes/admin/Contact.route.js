import express from "express";
import AdminController from "../../controllers/AdminController.js";

const adminContactRouter = express.Router();

adminContactRouter.get("/", AdminController.listRequests);
adminContactRouter.get("/:id", AdminController.getRequest);
adminContactRouter.patch("/:id", AdminController.updateRequest);

export default adminContactRouter;