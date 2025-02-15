import express from "express";
import path from "path";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo"; 
import { fileURLToPath } from "url";
import productRouter from "./product/router.js";
import authRouter from "./user/router.js";
import { connectDB } from "./config/db.js";
import homeRouter from "./home/router.js";
import logoutRouter from "./logout/router.js";
import updateUserRouter from "./updateuser/router.js"; 
import updateUserRouter from "./user/router.js"
import adminRouter from "./admin/router.js";
import cartRouter from './cart/router.js';
import transactionRoutes from './transaction/router.js';
import checkoutGuestRoutes from './guest/routercheckout.js';
import guestCartRouter from './guest/routerCart.js';
import forgotPasswordRouter from "./forgotpassword/router.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

///view
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Cấu hình session
app.use(session({
    secret: process.env.SESSION_SECRET || "defaultSecretKey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URI, // Đảm bảo đúng URL MongoDB
        collectionName: "sessions",
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // Cookie sống trong 1 ngày
    },
}));


connectDB(process.env.DB_URI);

// Các route
app.use("/api", authRouter);//người dùng
app.use("/api", productRouter);//sản phẩm
app.use("/", logoutRouter);//đăng xuất
app.use("/user", updateUserRouter);//cập nhật thông tin
app.use("/", updateUserRouter);
app.use("/admin", adminRouter);//admin
app.use("/api/cart", cartRouter);//giỏ hàng
app.use('/transactions', transactionRoutes);//lịch sử giao dịch
app.use('/checkout/guest', checkoutGuestRoutes);//thanh toán người dùng chưa đăng nhập
app.use('/guest-cart', guestCartRouter);//giỏ hàng người dùng chưa đăng nhập
app.use("/", forgotPasswordRouter);
// Đăng ký
app.get("/signup", (req, res) => {
    res.render("signup", { errors: [] });
});

// Đăng nhập
app.get("/signin", (req, res) => {
    const message = req.query.message || "";
    res.render("signin", { message });
});

// Trang home
app.use("/", homeRouter);

// Khởi chạy server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

export default app;
export const viteNodeApp = app;
