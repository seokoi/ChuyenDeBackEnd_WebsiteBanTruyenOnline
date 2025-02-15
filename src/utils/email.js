import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình transporter với SMTP của Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME, // Email gửi
        pass: process.env.EMAIL_PASSWORD, // Mật khẩu ứng dụng Gmail
    },
});

/**
 * Hàm gửi email thông báo
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} text - Nội dung email
 */
export const sendEmail = async (to, subject, text) => {
    if (!to) {
        console.error("❌ Lỗi: Không có email người nhận.");
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email đã gửi tới ${to}: ${subject}`);
    } catch (error) {
        console.error("❌ Lỗi khi gửi email:", error);
    }
};
