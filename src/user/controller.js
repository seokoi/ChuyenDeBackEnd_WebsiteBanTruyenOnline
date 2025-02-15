import bcryptjs from "bcryptjs";
import User from "../user/model";

// Đăng ký
export const signup = async (req, res) => {
  const { username, password, confirmPassword, email, age } = req.body;

  try {
    // Kiểm tra mật khẩu chỉ chứa chữ và số
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      return res
        .status(400)
        .render("signup", { errors: ["Mật khẩu chỉ được chứa chữ và số."] });
    }

    if (password !== confirmPassword) {
      return res.status(400).render("signup", {
        errors: ["Mật khẩu và Xác nhận mật khẩu không khớp."],
      });
    }

    // Kiểm tra xem username hoặc email đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).render("signup", {
        errors: ["Tên người dùng đã tồn tại, vui lòng chọn tên khác."],
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).render("signup", {
        errors: ["Email đã được sử dụng, vui lòng chọn email khác."],
      });
    }

    // Hash mật khẩu
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Tạo người dùng mới
    await User.create({
      username,
      email,
      password: hashedPassword,
      age,
    });

    res.redirect("/signin?message=Đăng ký thành công! Vui lòng đăng nhập.");
  } catch (err) {
    console.error("Lỗi trong quá trình đăng ký:", err);

    // Kiểm tra lỗi MongoDB trùng lặp key
    if (err.code === 11000) {
      let errorMsg = "Đã xảy ra lỗi, vui lòng thử lại.";
      if (err.keyPattern.username) {
        errorMsg = "Tên người dùng đã tồn tại, vui lòng chọn tên khác.";
      } else if (err.keyPattern.email) {
        errorMsg = "Email đã được sử dụng, vui lòng chọn email khác.";
      }
      return res.status(400).render("signup", { errors: [errorMsg] });
    }

    res
      .status(500)
      .render("signup", { errors: ["Đã xảy ra lỗi, vui lòng thử lại sau."] });
  }
};
// Đăng nhập
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render("signin", {
        message: "Email không tồn tại.",
        email,
      });
    }

    // So sánh mật khẩu nhập với hash mật khẩu trong DB
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).render("signin", {
        message: "Mật khẩu không chính xác.",
        email,
      });
    }

    // Lưu thông tin vào session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    // Chuyển hướng dựa trên vai trò
    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    } else if (user.role === "user") {
      return res.redirect(
        "/home2?message=Chào mừng bạn đến với cửa hàng Coffee House!"
      );
    } else {
      return res.status(403).render("signin", {
        message: "Vai trò không hợp lệ.",
        email,
      });
    }
  } catch (err) {
    console.error("Lỗi trong quá trình đăng nhập:", err);
    res.status(500).render("signin", {
      message: "Đã xảy ra lỗi, vui lòng thử lại sau.2",
      email,
    });
  }
  console.log("Email:", email);
  console.log("Mật khẩu nhập vào:", password);
  console.log("Thông tin user từ DB:", user);
  console.log("Hash trong DB:", user ? user.password : "Không tìm thấy user");
  console.log(
    "Kết quả so sánh mật khẩu:",
    await bcryptjs.compare(password, user.password)
  );
};

// Thay đổi mật khẩu
export const updatePassword = async (req, res) => {
  const { oldPassword, password, confirmPassword } = req.body;

  if (!req.user) {
    return res.status(401).send("Bạn chưa đăng nhập.");
  }

  if (password !== confirmPassword) {
    return res.status(400).render("update-password", {
      errors: ["Mật khẩu mới và xác nhận mật khẩu không khớp."],
      user: req.user, // Truyền thông tin người dùng để giữ dữ liệu trong form
    });
  }

  try {
    const user = await User.findById(req.user._id);

    // Kiểm tra mật khẩu cũ
    const isOldPasswordValid = await bcryptjs.compare(
      oldPassword,
      user.password
    );
    if (!isOldPasswordValid) {
      return res.status(400).render("update-password", {
        errors: ["Mật khẩu cũ không chính xác."],
        user: req.user,
      });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcryptjs.hash(password, 10);
    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

    // Chuyển hướng về trang home2 với thông báo
    res.redirect(`/home2?message=Cập nhật mật khẩu thành công!`);
  } catch (error) {
    console.error("Lỗi khi thay đổi mật khẩu:", error);
    res.status(500).render("update-password", {
      errors: ["Đã xảy ra lỗi, vui lòng thử lại sau.3"],
      user: req.user,
    });
  }
};

// Đăng xuất
export const logout = (req, res) => {
  try {
    // Xóa session của người dùng
    req.session.destroy((err) => {
      if (err) {
        console.error("Lỗi khi xóa session:", err);
        return res.status(500).send("Đã xảy ra lỗi khi đăng xuất.");
      }
      // Chuyển hướng về trang chủ
      res.redirect("/?message=Bạn đã đăng xuất thành công!");
    });
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    res.status(500).send("Đã xảy ra lỗi, vui lòng thử lại sau.4");
  }
};

// Hiển thị trang đổi thông tin người dùng
export const renderUpdateUserPage = async (req, res) => {
  try {
    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    if (!req.session.userId) {
      return res.redirect("/signin");
    }

    // Lấy thông tin người dùng từ cơ sở dữ liệu
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send("Không tìm thấy thông tin người dùng.");
    }

    // Render trang cập nhật với thông tin người dùng
    res.render("update-user", {
      user, // Truyền thông tin người dùng vào view
      errors: [],
    });
  } catch (error) {
    console.error("Lỗi khi hiển thị trang cập nhật thông tin:", error);
    res.status(500).send("Đã xảy ra lỗi, vui lòng thử lại sau.5");
  }
};

// Cập nhật thông tin người dùng
export const updateUserInfo = async (req, res) => {
  const { username, age } = req.body;

  try {
    // Kiểm tra nếu không có thông tin người dùng trong session
    if (!req.session || !req.session.userId) {
      return res.status(401).send("Bạn chưa đăng nhập.");
    }

    // Cập nhật thông tin người dùng trong MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      req.session.userId,
      { username, age },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("Không tìm thấy người dùng.");
    }

    // Cập nhật lại session với thông tin mới
    req.session.username = updatedUser.username;
    req.session.age = updatedUser.age;

    // Quay lại trang home2 với thông báo
    res.redirect("/home2?message=Cập nhật thông tin thành công!");
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin:", error);
    res.status(500).render("update-user", {
      user: req.session,
      errors: ["Đã xảy ra lỗi, vui lòng thử lại sau.6"],
    });
  }
};
