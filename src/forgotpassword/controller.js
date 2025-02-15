import User from "../user/model";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình gửi email
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// 📌 Gửi email đặt lại mật khẩu
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).render("forgot-password", { message: "Email không tồn tại trong hệ thống!" });
        }

        // Tạo mã token ngẫu nhiên
        const token = crypto.randomBytes(20).toString("hex");

        // Lưu token vào database
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Token hết hạn sau 1 giờ
        await user.save();

        // Gửi email chứa link đặt lại mật khẩu
        const resetUrl = `http://localhost:8080/reset-password/${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: "Yêu cầu đặt lại mật khẩu",
            text: `Bạn đã yêu cầu đặt lại mật khẩu. Nhấp vào link bên dưới để đặt lại mật khẩu: \n\n ${resetUrl} \n\n Liên kết này sẽ hết hạn sau 1 giờ.`,
        };

        await transporter.sendMail(mailOptions);

        res.render("forgot-password", { message: "Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư." });
    } catch (error) {
        console.error("Lỗi khi gửi email đặt lại mật khẩu:", error);
        res.status(500).render("forgot-password", { message: "Lỗi hệ thống, vui lòng thử lại sau!" });
    }
};

// 📌 Xác minh token và render form đổi mật khẩu
export const renderResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).render("reset-password", { message: "Token không hợp lệ hoặc đã hết hạn!", token: null });
        }

        res.render("reset-password", { token, message: "" });
    } catch (error) {
        console.error("Lỗi khi xác minh token:", error);
        res.status(500).send("Đã xảy ra lỗi, vui lòng thử lại sau!");
    }
};

// 📌 Cập nhật mật khẩu mới
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Kiểm tra xem mật khẩu mới có khớp không
        if (newPassword !== confirmPassword) {
            return res.render("reset-password", {
                message: "Mật khẩu mới không khớp!",
                messageType: "error",
                token
            });
        }

        // Tìm người dùng có token hợp lệ
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

        if (!user) {
            return res.render("reset-password", {
                message: "Token không hợp lệ hoặc đã hết hạn!",
                messageType: "error",
                token: null
            });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcryptjs.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.render("reset-password", {
                message: "Mật khẩu cũ không đúng!",
                messageType: "error",
                token
            });
        }

        // Kiểm tra xem mật khẩu mới có giống mật khẩu cũ không
        const isSameAsOld = await bcryptjs.compare(newPassword, user.password);
        if (isSameAsOld) {
            return res.render("reset-password", {
                message: "Mật khẩu mới không được trùng với mật khẩu cũ!",
                messageType: "error",
                token
            });
        }

        // Cập nhật mật khẩu mới
        user.password = await bcryptjs.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.redirect("/signin?message=Đổi mật khẩu thành công! Vui lòng đăng nhập.");
    } catch (error) {
        console.error("Lỗi khi đặt lại mật khẩu:", error);
        res.status(500).render("reset-password", {
            message: "Đã xảy ra lỗi, vui lòng thử lại sau!",
            messageType: "error",
            token: null
        });
    }
};

