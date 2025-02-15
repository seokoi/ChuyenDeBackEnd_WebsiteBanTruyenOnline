import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Định đường dẫn đến ảnh QR
const qrImagePath = path.resolve('./QR/QR.jpg'); // Đường dẫn đến ảnh QR

// Hiển thị trang thanh toán cho khách chưa đăng nhập
export const renderCheckoutGuest = (req, res) => {
    const cart = req.session.cart || { items: [] };
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.render('checkoutGuest', {
        cart,
        total,
        message: '',
        errors: [],
    });
};

// Xử lý thanh toán
export const handleGuestCheckout = async (req, res) => {
    const { email, fullName, address, phoneNumber, paymentMethod } = req.body;
    const cart = req.session.cart;

    if (!email || !fullName || !address || !phoneNumber || !paymentMethod || !cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin và đảm bảo giỏ hàng không rỗng!' });
    }

    try {
        const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const orderDate = new Date().toLocaleString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });

        let emailBody = `
            <p>Cửa hàng cafe Coffe House xin chào.</p>
            <p>Cảm ơn bạn đã đặt hàng, ${fullName}!</p>
            <p>Địa chỉ giao hàng của bạn là : ${address}</p>
            <p>Số điện thoại: ${phoneNumber}</p>
            <p>Ngày giờ đặt hàng: ${orderDate}</p>
            <p>Tổng tiền: ${total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
            <p>Phương thức thanh toán: ${paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</p>
            <p>Chi tiết đơn hàng:</p>
            <ul>
                ${cart.items.map(item => `<li>${item.name}: ${item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} x ${item.quantity}</li>`).join('')}
            </ul>
            <p>Coffe Housr xin chân thành cảm ơn vì sự ủng hộ và tin tưởng của bạn</p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Xác nhận đơn hàng của bạn',
            html: emailBody,
            attachments: []
        };

        // Nếu phương thức là chuyển khoản, đính kèm mã QR vào email
        if (paymentMethod !== 'cod') {
            mailOptions.html += `<p>Bạn vui lòng quét mã QR sau để thanh toán đơn hàng và xác nhận đơn hàng trong vòng 30 phút:</p>
                                 <img src="cid:qrCode" alt="QR Code Chuyển Khoản" style="width:120px; height:120px;"/>`;
            mailOptions.attachments.push({
                filename: 'QR.jpg',
                path: qrImagePath,
                cid: 'qrCode' // Định danh ảnh để sử dụng trong HTML
            });
        }

        await transporter.sendMail(mailOptions);

        console.log(`Đặt hàng thành công cho ${fullName} (${email}). Tổng tiền: ${total}`);

        // Xóa giỏ hàng
        req.session.cart = null;

        return res.status(200).json({ message: 'Đặt hàng thành công! Kiểm tra email để biết thêm chi tiết.' });
    } catch (error) {
        console.error('Lỗi khi gửi email:', error.message);
        return res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại sau!' });
    }
};
