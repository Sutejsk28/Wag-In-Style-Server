import express from "express";
import { addCategory, addProductImage, createProduct, deleteCategory, deleteProduct, deleteProductImage, getAdminProducts, getAllCategories, getAllProducts, getProductDetails, updateProduct } from "../controllers/product.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/getallproducts", getAllProducts)
router.get("/admin", isAuthenticated, isAdmin, getAdminProducts)

router.route("/productdetails/:id")
    .get(getProductDetails)
    .put(isAuthenticated, isAdmin,  updateProduct)
    .delete(isAuthenticated, isAdmin,  deleteProduct)

router.post("/newproduct", isAuthenticated, isAdmin, singleUpload, createProduct)

router.route("/images/:id")
    .post(isAuthenticated, isAdmin,  singleUpload, addProductImage)
    .delete(isAuthenticated ,isAdmin, deleteProductImage);

router.post( "/category/newcategory", isAuthenticated, isAdmin,  addCategory)

router.route("/category/getallcategories")
    .get(getAllCategories)

router.delete("/category/:id", isAuthenticated, isAdmin, deleteCategory)

export default router