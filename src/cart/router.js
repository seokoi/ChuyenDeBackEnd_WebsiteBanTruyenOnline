import express from "express";
import { addToCart, removeFromCart, getCart } from "../cart/controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Lấy giỏ hàng
router.get("/", authMiddleware, getCart);

// Thêm sản phẩm vào giỏ hàng
router.post("/add", authMiddleware, addToCart);

// Xóa sản phẩm khỏi giỏ hàng
router.delete("/remove", authMiddleware, removeFromCart);

export default router;
