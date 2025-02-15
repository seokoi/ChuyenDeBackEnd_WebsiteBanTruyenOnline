import express from "express";
import { forgotPassword, renderResetPassword, resetPassword } from "../forgotpassword/controller";

const router = express.Router();

router.get("/forgot-password", (req, res) => res.render("forgot-password", { message: "" }));
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", renderResetPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
