// Middleware kiểm tra API
const checkAuthAPI = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Áp dụng cho các route API cần bảo vệ
router.post("/api/cart/add", checkAuthAPI, cartController.addToCart);
router.delete("/api/cart/remove", checkAuthAPI, cartController.removeFromCart);
