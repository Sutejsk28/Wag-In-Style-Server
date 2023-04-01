import { asyncError } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary"
import { Category } from "../models/category.js";

export const getAllProducts = asyncError(
    async (req,res,next) => {
        const {keyword, category} = req.query

        let products;

        if(!keyword && !category) 
            products = await Product.find({})
        else {
            products = await Product.find({
                name: {
                    $regex: keyword ? keyword : "",
                    $options: "i",
                },
                category: category ? category : undefined
            })
        }
        

        res.status(200).json({
            success: true,
            products,
        })
    }
)

export const getAdminProducts = asyncError(
    async (req,res,next) => {
        const products = await Product.find({}).populate("category")

        let outOfStock = 0;

        for(let i=0; i<products.length; i++){
            if(products[i].stock===0) outOfStock++;
        }

        res.status(200).json({
            success: true,
            products,
            outOfStock: outOfStock,
            inStock: products.length-outOfStock
        })
    }
)

export const getProductDetails = asyncError(
    async (req,res,next) => {
        const product = await Product.findById(req.params.id).populate("category")
        
        if(!product) return next(new ErrorHandler("Product not found", 404))

        res.status(200).json({
            success: true,
            product,
        })
    }
)

export const createProduct = asyncError(
    async (req,res,next) => {
        
        const {name, description, price, stock, category} = req.body

        if(!req.file) return next(new ErrorHandler("Please add an image", 400))
        
        const file = getDataUri(req.file);
        const cloudResponse = await cloudinary.v2.uploader.upload(file.content)
        const image = {
            public_id: cloudResponse.public_id,
            url: cloudResponse.secure_url,
        }
        
        await Product.create({
            name, description, price, stock, category,
            images: [image]
        })

        res.status(200).json({
            success: true,
            message: "Product Created Successfully",
        })
    }
)

export const updateProduct = asyncError(
    async (req,res,next) => {
        
        const {name, description, price, stock, category} = req.body

        const product = await Product.findById(req.params.id)
        if(!product) return next(new ErrorHandler("Product not found", 404))
        
        if(name) product.name = name
        if(description) product.description = description
        if(price) product.price = price
        if(stock) product.stock = stock
        if(category) product.category = category

        await product.save()

        res.status(200).json({
            success: true,
            message: "Product Updated Successfully",
        })
    }
)

export const addProductImage = asyncError(
    async (req,res,next) => {
        
        const product = await Product.findById(req.params.id)
        if(!product) return next(new ErrorHandler("Product not found", 404))
        
        if(!req.file) return next(new ErrorHandler("Please add an image", 400))
        
        const file = getDataUri(req.file);
        const cloudResponse = await cloudinary.v2.uploader.upload(file.content)
        const image = {
            public_id: cloudResponse.public_id,
            url: cloudResponse.secure_url,
        }
        
        product.images.push(image)
        await product.save()

        res.status(200).json({
            success: true,
            message: "Image added Successfully",
        })
    }
)

export const deleteProduct = asyncError(
    async (req,res,next) => {
        
        const product = await Product.findById(req.params.id)
        if(!product) return next(new ErrorHandler("Product not found", 404))
        
        for(let index=0 ; index<product.images.length ; index++){
            await cloudinary.v2.uploader.destroy(product.images[index].public_id)
        }

        await Product.findByIdAndRemove(req.params.id)

        res.status(200).json({
            success: true,
            message: "Product Deleted Successfully",
        })
    }
)

export const deleteProductImage = asyncError(
    async (req,res,next) => {
        
        const product = await Product.findById(req.params.id)
        if(!product) return next(new ErrorHandler("Product not found", 404))
        
        const id = req.query.id
        if(!id) return next(new ErrorHandler("Please add image id", 400))

        let existAt = -1

        product.images.forEach((item,index)=>{
            if(item._id.toString() === id.toString()) 
                existAt = index
        })

        if(existAt<0) return next(new ErrorHandler("image does not exist", 400))

        await cloudinary.v2.uploader.destroy(product.images[existAt].public_id)

        product.images.splice(existAt, 1)

        await product.save()

        res.status(200).json({
            success: true,
            message: "Image Deleted Successfully",
        })
    }
)

export const addCategory = asyncError(
    async (req,res,next) => {
        const { category } = req.body

        if(!category) return next(new ErrorHandler("Enter category name", 400))

        await Category.create({
            category
        })

        res.status(201).json({
            success: true,
            message: "Category added successfully"
        })
    }
)

export const getAllCategories = asyncError(
    async (req,res,next) => {
        console.log("categories");
        const categories = await Category.find({})
        res.status(200).json({
            success: true,
            categories
        })
    }
)

export const deleteCategory = asyncError(
    async (req,res,next) => {
        const category = await Category.findById(req.params.id)

        if(!category) return next(new ErrorHandler("category not found", 404))

        const products = await Product.find({
            category: category._id
        })

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            product.category=undefined;
            await product.save()
        }
        await Category.findByIdAndRemove(req.params.id)

        res.status(201).json({
            success: true,
            message: "Category deleted successfully"
        })
    }
)