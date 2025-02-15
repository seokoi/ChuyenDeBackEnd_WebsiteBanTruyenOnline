import express from "express";
import { renderHomePage, renderHome2, renderUpdatepassword, renderCheckoutPage, handleCheckout } from "../home/controller.js"; 
import { isAuthenticated  } from "../middleware/authMiddleware.js";


const router = express.Router();

//  home1
router.get("/", renderHomePage);

//  home2
router.get("/home2", isAuthenticated, renderHome2);

//thay đổi mật khẩu
router.get("/update-password", renderUpdatepassword);

//router thanh toán
router.get('/checkout', isAuthenticated, renderCheckoutPage);
router.post('/checkout', isAuthenticated, handleCheckout);



export default router;
