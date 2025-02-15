// Xử lý đăng nhập thành công
router.post("/signin", async (req, res) => {
  try {
    // ... xử lý đăng nhập ...
    if (success) {
      req.session.userId = user._id;
      req.session.user = user;
      res.redirect("/home"); // Chuyển đến home2
    }
  } catch (error) {
    // ... xử lý lỗi ...
  }
});

// Xử lý đăng xuất
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/"); // Chuyển về home1
  });
});
