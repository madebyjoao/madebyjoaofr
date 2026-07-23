import express from "express";
import AdminController from "../../controllers/AdminController.js";

const adminContactRouter = express.Router();

adminContactRouter.get("/", AdminController.listRequests);

export default adminContactRouter;