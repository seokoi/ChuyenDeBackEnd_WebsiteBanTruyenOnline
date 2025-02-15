import User from "../user/model.js";
import { isAdmin } from "./adminMiddleware.js";
export const isAuthenticated = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).send("Bạn chưa đăng nhập.");
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send("Không tìm thấy thông tin người dùng.");
        }

        req.user = user; // Gắn user vào request
        next();
    } catch (error) {
        console.error("Lỗi trong middleware isAuthenticated:", error);
        res.status(500).send("Đã xảy ra lỗi.");
    }
};
export const isAdmin = (req, res, next) => {
    if (!req.session || req.session.role !== "admin") {
        return res.status(403).send("Bạn không có quyền truy cập.");
    }
    next();
};
const authMiddleware = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Người dùng chưa đăng nhập." });
    }
    next();
};

export default authMiddleware;




