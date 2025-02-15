import express from 'express';
import { addToCart, removeFromCart, checkout } from '../guest/cart';

const router = express.Router();

// Các route của guest cart
router.post('/add', addToCart);
router.delete('/remove', removeFromCart);

export default router;
