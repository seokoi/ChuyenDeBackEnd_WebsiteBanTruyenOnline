import { Transaction } from "../transaction/model.js";
import { sendEmail } from "../utils/email"; // Hàm gửi email thông báo

// Lấy lịch sử giao dịch của người dùng
export const getTransactionHistory = async (req, res) => {
    const { userId } = req.session;

    if (!userId) {
        return res.status(401).redirect('/login');
    }

    try {
        const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
        res.render('transaction-history', {
            user: req.user || {},
            transactions,
        });
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử giao dịch:", error);
        res.status(500).send("Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
};
// Hủy đơn hàng (người dùng có thể hủy nếu chưa ở trạng thái "Đang giao" hoặc "Đã giao")
export const cancelTransaction = async (req, res) => {
    const { userId } = req.session;
    const { transactionId } = req.params;

    if (!userId) {
        return res.status(401).send("Vui lòng đăng nhập để thực hiện thao tác này.");
    }

    try {
        const transaction = await Transaction.findOne({ _id: transactionId, userId })
            .populate("userId", "email"); // Chắc chắn lấy email người dùng

        if (!transaction) {
            return res.status(404).send("Không tìm thấy đơn hàng.");
        }

        if (["Đang giao", "Đã giao"].includes(transaction.status)) {
            return res.status(400).send("Không thể hủy đơn hàng khi đang giao hoặc đã giao.");
        }

        transaction.status = "Đã huỷ";
        await transaction.save();

        // Kiểm tra email trước khi gửi
        if (transaction.userId && transaction.userId.email) {
            sendEmail(transaction.userId.email, "Đơn hàng đã bị hủy", `Đơn hàng của bạn đã bị hủy thành công.`);
        } else {
            console.error("❌ Không tìm thấy email của người dùng để gửi thông báo.");
        }

        res.json({ message: "Đơn hàng đã được hủy thành công!" });
    } catch (error) {
        console.error("Lỗi khi hủy đơn hàng:", error);
        res.status(500).send("Có lỗi xảy ra, vui lòng thử lại.");
    }
};

// Admin cập nhật trạng thái đơn hàng
export const updateTransactionStatus = async (req, res) => {
    const { transactionId } = req.params;
    const { status } = req.body;

    try {
        const transaction = await Transaction.findById(transactionId).populate("userId", "email"); // Đảm bảo lấy email

        if (!transaction) {
            return res.status(404).send("Không tìm thấy đơn hàng.");
        }

        transaction.status = status;
        await transaction.save();

        // Kiểm tra email trước khi gửi
        if (transaction.userId && transaction.userId.email) {
            sendEmail(transaction.userId.email, "Cập nhật trạng thái đơn hàng", `Đơn hàng của bạn hiện có trạng thái: ${status}`);
        } else {
            console.error("❌ Không tìm thấy email của người dùng để gửi thông báo.");
        }

        res.json({ message: "Cập nhật trạng thái đơn hàng thành công!" });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        res.status(500).send("Có lỗi xảy ra, vui lòng thử lại.");
    }
};