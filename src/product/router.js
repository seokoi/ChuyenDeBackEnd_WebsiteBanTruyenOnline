import express from "express";
import { addProduct, deleteProduct, getProducts, getProductsById, updateProduct } from "../product/controller";

const router = express.Router();

router.get(`/products`, getProducts);
router.get(`/products/:id`, getProductsById);
router.post(`/products`, addProduct);//thêm sản phẩm
router.put(`/products/:id`, updateProduct); //cập nhật sản phâmr 
router.delete(`/products/:id`, deleteProduct);//xoá sản phẩm

export default router;