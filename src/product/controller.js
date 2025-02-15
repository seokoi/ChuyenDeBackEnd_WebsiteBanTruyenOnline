import Product from "../product/model";
//lấy giỏ hàng
export const getProducts = async (req, res) => {
    try {
        const data = await Product.find();
        if (data.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        res.status(200).json(data); 
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
};


export const getProductsById = async (req, res) => {
    try {
        const data = await Product.findOne({ _id: req.params.id });
        if (!data) { 
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(data); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//thêm sản phẩm
export const addProduct = async (req, res) => {
    try {
        const data = await new Product(req.body).save(); 
        res.status(201).json(data); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//xoá sản phẩm
export const deleteProduct = async (req, res) => {
    try {
        const data = await Product.findOneAndDelete({ _id: req.params.id });
        if (!data) { 
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//cập nhật sản hẩm
export const updateProduct = async (req, res) => {
    try {
        const data = await Product.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        );
        if (!data) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(data); 
    } catch (error) {
        console.error("Error updating product: ", error); 
        res.status(500).json({ message: error.message });
    }
};
//render trang admin
export const renderAdminPage = async (req, res) => {
    try {
        const products = await Product.find(); 
        res.render("admin", { products });
    } catch (error) {
        console.error("Error rendering admin page:", error);
        res.status(500).send("Đã xảy ra lỗi, vui lòng thử lại sau.11");
    }
};

