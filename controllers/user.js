import { asyncError } from "../middlewares/error.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { cookieOptions, getDataUri, sendToken } from "../utils/features.js";
import cloudinary from 'cloudinary'

export const login = asyncError(async (req,res,next) => {

    const {email, password} = req.body;

    const user = await User.findOne({email}).select("+password")

    if(!user)
        return next(new ErrorHandler("Incorrect Email or password", 404))

    const isMatched = await user.comparePassword(password)

    if(!isMatched) 
        return next(new ErrorHandler("Incorrect Email or Password", 400))
    
    sendToken(user, res, `Welcome Back ${user.name}`, 200)
}
)

export const signup = asyncError(async (req,res,next) => {

    const { name, email, password, address, city, country, pinCode } = req.body;

    let user = User.findOne({email})

    if(!user) return next(new ErrorHandler("User Already Exists", 404))

    let avatar = undefined

    if (req.file) {
        const file = getDataUri(req.file);
        const cloudResponse = await cloudinary.v2.uploader.upload(file.content)
        avatar = {
            public_id: cloudResponse.public_id,
            url: cloudResponse.secure_url,
        }
    }

    user = await User.create({
        avatar, name, email, password, address, city, country, pinCode
    })
    
    sendToken(user, res, "Registered Successfully", 201)
} 
)

export const logout = asyncError(
    async (req,res,next)=>{

        res
            .status(200)
            .cookie("token", "", {
                ...cookieOptions,
                expires: new Date(Date.now())
            })
            .json({
                success: true,
                message: "Logged Out Successfully",
            })

    }
)

export const getProfile = asyncError(
    async (req,res,next)=>{
        const user = await User.findById(req.user._id)

        res.status(200).json({
            success: true,
            user,
        })

    }
)

export const updateProfile = asyncError(
    async (req,res,next)=>{
        const user = await User.findById(req.user._id)

        const { name, email, address, city, country, pinCode } = req.body;

        if (name) user.name = name
        if (email) user.email = email
        if (address) user.address = address
        if (city) user.city = city
        if (country) user.country = country
        if (pinCode) user.pinCode = pinCode
        
        await user.save()

        res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
        })
    }
)

export const changePassword = asyncError(
    async (req,res,next)=>{
        const user = await User.findById(req.user._id).select("+password")

        const {oldPassword, newPassword} = req.body

        if(!oldPassword || !newPassword) return  next(new ErrorHandler("Please Enter Old Password and New Password", 400))

        const isMatched = await user.comparePassword(oldPassword)

        if(!isMatched) return  next(new ErrorHandler("Incorrect Old Password", 400))

        user.password = newPassword
        await user.save()

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        })

    }
)

export const updatePic = asyncError(
    async (req,res,next)=>{
        const user = await User.findById(req.user._id)

        if (req.file) {
            const file = getDataUri(req.file);
            await cloudinary.v2.uploader.destroy(user.avatar.public_id)
            const cloudResponse = await cloudinary.v2.uploader.upload(file.content)
            user.avatar = {
                public_id: cloudResponse.public_id,
                url: cloudResponse.secure_url,
            }

            await user.save()
        
            res.status(200).json({
                success: true,
                message: "Avatar updated susccessfully",
            })

        }

    }
)