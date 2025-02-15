import express from "express";
import { renderUpdateUserPage, updateUser } from "../updateuser/controller.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/update-user",isAuthenticated,  renderUpdateUserPage); // Hiển thị form cập nhật
router.post("/update-user",isAuthenticated, updateUser); //cập nhật thông tin

export default router;
