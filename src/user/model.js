import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        age: { type: Number, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        resetPasswordToken: { type: String }, 
        resetPasswordExpires: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
