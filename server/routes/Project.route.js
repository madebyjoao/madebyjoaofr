import express from "express";
import ProjectController from "../controllers/ProjectController.js";

const projectRouter = express.Router();

projectRouter.get("/", ProjectController.list);
projectRouter.get("/:slug", ProjectController.getBySlug);

export default projectRouter;