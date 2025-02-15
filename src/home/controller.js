import Product from "../product/model.js";
import Cart from '../cart/model.js';
import nodemailer from 'nodemailer';
import { Transaction } from "../transaction/model.js";
import fs from 'fs';
import path from 'path';

//render trang home 1
export const renderHomePage = async (req, res) => {
    try {
        const products = await Product.find();

        res.render("home1", {
            products, 
            cart: req.session.cart || { items: [] }, // Truyền giỏ hàng vào giao diện
            message: req.query.message || "", 
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Lỗi hệ thống, vui lòng thử lại sau.");
    }
};


//reder tranh home2
export const renderHome2 = async (req, res) => {
    try {
        const userId = req.session.userId; // Lấy userId từ session
        const username = req.query.username || req.user?.username || "Người dùng";

        // Lấy danh sách sản phẩm
        const products = await Product.find();

        // Lấy giỏ hàng của người dùng
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        res.render('home2', {
            username,
            products,
            cart: cart || { items: [] }, // Nếu không có giỏ hàng, truyền giỏ hàng rỗng
            message: req.query.message || "",
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        res.status(500).send("Đã xảy ra lỗi, vui lòng thử lại sau.9");
    }
};



//render trang đổi mật khẩu
export const renderUpdatepassword = (req, res) => {
    const user = {
        username: "",
        email: "",
        age: 25
    }; // Thay thế bằng dữ liệu thực tế từ DB
    res.render("update-password", { user, errors: [] });
};


//thanh toán
export const renderCheckoutPage = async (req, res) => {
    const user = req.user || {};
    const { userId } = req.session;

    let total = 0;

    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (cart) {
            total = cart.items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);
        }
    } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
    }

    res.render('checkout', {
        user,
        total, // Tổng thanh toán
        errors: [], // Danh sách lỗi
        message: "", // Thông báo
    });
};

// Định đường dẫn đến ảnh QR
const qrImagePath = path.resolve('./QR/QR.jpg');

export const handleCheckout = async (req, res) => {
    console.log("Dữ liệu từ form:", req.body);
    const { fullName, phoneNumber, address, ward, district, city, paymentMethod } = req.body;
    const { userId } = req.session;

    if (!fullName || !phoneNumber || !address || !ward || !district || !city || !paymentMethod) {
        return res.status(400).render('checkout', {
            errors: ["Vui lòng điền đầy đủ thông tin và chọn phương thức thanh toán."],
            user: req.user || {},
            total: 0,
        });
    }

    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).render('checkout', {
                errors: ["Giỏ hàng trống. Không thể thanh toán."],
                user: req.user || {},
                total: 0,
            });
        }

        const total = cart.items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);
        const email = req.user?.email || '';
        if (!email) {
            return res.status(400).render('checkout', {
                errors: ["Không tìm thấy email người dùng."],
                user: req.user || {},
                total,
            });
        }

        const orderDate = new Date().toLocaleString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        let emailBody = `
            <p>Cửa hàng cafe Coffe House xin chào.</p>
            <p>Cảm ơn bạn đã đặt hàng, ${fullName}!</p>
            <p>Địa chỉ giao hàng của bạn là: ${address}, ${ward}, ${district}, ${city}</p>
            <p>Số điện thoại: ${phoneNumber}</p>
            <p>Ngày giờ đặt hàng: ${orderDate}</p>
            <p>Tổng tiền: ${total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
            <p>Phương thức thanh toán: ${paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</p>
            <p>Chi tiết đơn hàng:</p>
            <ul>
                ${cart.items.map(item => `<li>${item.productId.name}: ${item.productId.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} x ${item.quantity}</li>`).join('')}
            </ul>
            <p>Coffee House xin chân thành cảm ơn vì sự ủng hộ và tin tưởng của bạn</p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Xác nhận đơn hàng của bạn',
            html: emailBody,
            attachments: []
        };

        if (paymentMethod !== 'cod') {
            mailOptions.html += `<p>Bạn vui lòng quét mã QR sau để thanh toán đơn hàng và xác nhận đơn hàng trong vòng 30 phút:</p>
                                 <img src="cid:qrCode" alt="QR Code Chuyển Khoản" style="width:120px; height:120px;"/>`;
            mailOptions.attachments.push({
                filename: 'QR.jpg',
                path: qrImagePath,
                cid: 'qrCode'
            });
        }

        await transporter.sendMail(mailOptions);

        const transaction = new Transaction({
            userId,
            fullName,
            phoneNumber,
            address,
            ward,
            district,
            city,
            total,
            paymentMethod,
            createdAt: new Date(),
        });
        await transaction.save();

        await Cart.deleteOne({ userId });
        res.redirect('/home2?message=Đặt hàng thành công! Kiểm tra email để biết thêm chi tiết.');
    } catch (error) {
        console.error("Lỗi khi xử lý thanh toán:", error);
        res.status(500).render('checkout', {
            errors: ["Đã xảy ra lỗi, vui lòng thử lại sau."],
            user: req.user || {},
            total: 0,
        });
    }
};
