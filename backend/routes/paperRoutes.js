import express from "express";
import {
  createPaper,
  getPapers,
  getPaperById,
  updatePaper,
  deletePaper,
} from "../controllers/paperController.js";

const paperRoutes = express.Router();

paperRoutes.post("/", createPaper);
paperRoutes.get("/", getPapers);
paperRoutes.get("/:id", getPaperById);
paperRoutes.put("/:id", updatePaper);
paperRoutes.delete("/:id", deletePaper);

export default paperRoutes;
