import express from 'express';
import { renderCheckoutGuest, handleGuestCheckout } from '../guest/checkout';

const router = express.Router();

// Hiển thị trang thanh toán
router.get('/', renderCheckoutGuest);

// Xử lý thanh toán
router.post('/', handleGuestCheckout);

export default router;
