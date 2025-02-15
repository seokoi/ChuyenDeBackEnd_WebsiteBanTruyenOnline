import User from "../user/model.js";

export const isAdmin = (req, res, next) => {
    if (!req.session || !req.session.role || req.session.role !== "admin") {
        return res.status(403).send("Bạn không có quyền truy cập.");
    }
    next();
};

