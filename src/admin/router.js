import express from "express";
import multer from "multer";
import {
    renderManageProductsPage,
    addProduct,
    updateProduct,
    deleteProduct,
} from "../admin/controller.js"; // Import controller
import { isAdmin } from "../middleware/authMiddleware.js"; // Middleware kiểm tra quyền admin
import { renderAdminDashboard, getAdminOrders } from "../admin/controller.js";

// Cấu hình lưu tệp tạm thời với Multer
const storage = multer.memoryStorage();
// const upload = multer({ storage });
const upload = multer({ dest: "uploads/" }); 
const router = express.Router();

router.get("/dashboard", renderAdminDashboard);
// Route: Trang quản lý sản phẩm
router.get("/products", isAdmin, renderManageProductsPage);

// Route: Thêm sản phẩm mới
router.post("/products", isAdmin, upload.single("image"), addProduct);

// Route: Cập nhật sản phẩm
router.post("/products/:id", isAdmin, upload.single("image"), updateProduct);

// Route: Xóa sản phẩm
router.get("/products/delete/:id", isAdmin, deleteProduct);

// Route để xem danh sách đơn hàng
router.get('/orders', getAdminOrders);

export default router;
