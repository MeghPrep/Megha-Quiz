import express from "express";
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";

const questionRoutes = express.Router();

questionRoutes.post("/", createQuestion);
questionRoutes.get("/", getQuestions);
questionRoutes.get("/:id", getQuestionById);
questionRoutes.put("/:id", updateQuestion);
questionRoutes.delete("/:id", deleteQuestion);

export default questionRoutes;
