import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const {connection} = await mongoose.connect(process.env.MONGO_URI , {
            dbName: "WagInStyleStore"
        })
        console.log(`Server connected to database ${connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
} 