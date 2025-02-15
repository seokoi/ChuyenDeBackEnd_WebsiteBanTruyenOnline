import User from "../user/model";
import bcryptjs from "bcryptjs";

// Hàm render trang cập nhật thông tin
export const renderUpdateUserPage = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId); 
        if (!user) {
            return res.status(404).send("Không tìm thấy thông tin người dùng.");
        }

        res.render("update-user", { user, errors: [] });
    } catch (error) {
        console.error("Lỗi khi hiển thị trang cập nhật thông tin:", error);
        res.status(500).send("Đã xảy ra lỗi, vui lòng thử lại sau.12");
    }
};


// Hàm xử lý cập nhật mật khẩu
export const updateUser = async (req, res) => {
    const { password, confirmPassword } = req.body;

    try {
        if (!req.session.user) {
            return res.status(401).send("Bạn chưa đăng nhập.");
        }

        if (password !== confirmPassword) {
            return res.render("update-password", {
                user: req.session.user,
                errors: ["Mật khẩu và xác nhận mật khẩu không khớp."],
            });
        }

        // Hash mật khẩu mới
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Cập nhật mật khẩu người dùng trong MongoDB
        await User.findByIdAndUpdate(req.session.user._id, {
            password: hashedPassword,
        });

        res.render("home1", { message: "Mật khẩu đã được cập nhật thành công!" });
    } catch (error) {
        console.error("Lỗi khi cập nhật mật khẩu:", error);
        res.status(500).send("Đã xảy ra lỗi, vui lòng thử lại sau.13");
    }
};
