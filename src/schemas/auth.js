import pkg from "joi";
const Joi = pkg;

export const registerSchema = Joi.object({
    username: Joi.string().required().messages({
        "any.required": "Tên người dùng là bắt buộc",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Email không hợp lệ",
        "any.required": "Email là bắt buộc",
    }),
    password: Joi.string().min(6).required().messages({
        "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
        "any.required": "Mật khẩu là bắt buộc",
    }),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
        "any.only": "Xác nhận mật khẩu không khớp",
        "any.required": "Xác nhận mật khẩu là bắt buộc",
    }),
    age: Joi.number().min(1).required().messages({
        "any.required": "Tuổi là bắt buộc",
        "number.min": "Tuổi không hợp lệ",
    }),
});
