import nodemailer from 'nodemailer';

// Thêm sản phẩm vào giỏ hàng
export const addToCart = (req, res) => {
    const { productId, price, name } = req.body;

    if (!req.session.cart) {
        req.session.cart = { items: [] }; // Tạo giỏ hàng
    }

    const existingItem = req.session.cart.items.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        req.session.cart.items.push({ productId, name, price, quantity: 1 });
    }

    res.status(200).json({ message: 'Thêm sản phẩm vào giỏ hàng thành công', cart: req.session.cart });
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = (req, res) => {
    const { productId } = req.body;

    if (!req.session.cart) {
        return res.status(400).json({ message: 'Giỏ hàng trống!' });
    }

    req.session.cart.items = req.session.cart.items.filter(item => item.productId !== productId);

    res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng!' });
};