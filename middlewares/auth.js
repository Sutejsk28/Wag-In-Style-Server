import ErrorHandler from "../utils/ErrorHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.js"
import { asyncError } from "./error.js"

export const isAuthenticated = asyncError(
    async (req,res,next) => {
        const {token} = req.cookies
    
        if(!token) return next(new ErrorHandler("Login to access", 401))
        
        const decodedData = jwt.verify(token, process.env.JWT_SECRET)
        
        req.user = await User.findById(decodedData._id)
        next()
    }
)