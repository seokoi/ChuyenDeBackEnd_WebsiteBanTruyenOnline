import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    ward: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: {
        type: String,
        enum: ["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Đã huỷ", "Đã giao"],
        default: "Chờ xác nhận"
    },
    createdAt: { type: Date, default: Date.now },
});

export const Transaction = mongoose.model('Transaction', TransactionSchema);
