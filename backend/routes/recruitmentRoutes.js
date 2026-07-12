import express from "express";
import {
  createRecruitment,
  getRecruitments,
  getRecruitmentById,
  updateRecruitment,
  deleteRecruitment,
} from "../controllers/recruitmentController.js";
const recruitmentRoutes = express.Router();

recruitmentRoutes.post("/", createRecruitment);
recruitmentRoutes.get("/", getRecruitments);
recruitmentRoutes.get("/:id", getRecruitmentById);
recruitmentRoutes.put("/:id", updateRecruitment);
recruitmentRoutes.delete("/:id", deleteRecruitment);

export default recruitmentRoutes;
