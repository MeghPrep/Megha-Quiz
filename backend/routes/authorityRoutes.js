import express from "express";
import {
  createAuthority,
  getAuthorities,
  getAuthorityById,
  updateAuthority,
  deleteAuthority,
} from "../controllers/authorityController.js";
const authorityRoutes = express.Router();

authorityRoutes.post("/", createAuthority);
authorityRoutes.get("/", getAuthorities);
authorityRoutes.get("/:id", getAuthorityById);
authorityRoutes.put("/:id", updateAuthority);
authorityRoutes.delete("/:id", deleteAuthority);

export default authorityRoutes;
