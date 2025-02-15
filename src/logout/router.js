import express from "express";
import { logout } from "../user/controller";

const router = express.Router();

router.get("/logout", logout); 

export default router;
