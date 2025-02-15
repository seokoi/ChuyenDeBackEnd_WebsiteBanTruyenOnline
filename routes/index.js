// Middleware kiểm tra đăng nhập
const checkAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Nếu đã đăng nhập, cho phép truy cập home2
    next();
  } else {
    // Nếu chưa đăng nhập, chuyển về home1
    res.redirect("/");
  }
};

// Route cho trang chủ
router.get("/", (req, res) => {
  if (req.session && req.session.userId) {
    // Nếu đã đăng nhập, chuyển đến home2
    res.redirect("/home");
  } else {
    // Nếu chưa đăng nhập, hiển thị home1
    res.render("home1", {
      message: req.flash("message"),
      cart: req.session.cart || { items: [] },
      products: [], // Thêm dữ liệu products nếu cần
    });
  }
});

// Route cho home2 (trang sau khi đăng nhập)
router.get("/home", checkAuth, (req, res) => {
  res.render("home2", {
    message: req.flash("message"),
    cart: req.session.cart || { items: [] },
    products: [], // Thêm dữ liệu products nếu cần
    user: req.session.user,
  });
});
