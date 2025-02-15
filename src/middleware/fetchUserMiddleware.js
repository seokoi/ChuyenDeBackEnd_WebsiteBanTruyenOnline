import User from "../user/model.js";

export const fetchUserMiddleware = async (req, res, next) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.redirect("/signin"); // Chuyển hướng nếu không tìm thấy userId trong session
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect("/signin");
        }

        // Lưu thông tin người dùng vào req
        req.user = user;
        next();
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        res.status(500).send("Lỗi hệ thống, vui lòng thử lại sau.");
    }
};

