import express from "express";
import { createOrder, getAdminOrders, getOrderDetails, getUserOrders, processOrder, processPayment } from "../controllers/order.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router()

router.post("/addorder", isAuthenticated, createOrder )
router.get("/getuserorders", isAuthenticated, getUserOrders)

router.post("/payment", isAuthenticated, processPayment)

router.get("/admin", isAuthenticated, isAdmin, getAdminOrders)

router.route("/orderdetails/:id")
    .get(isAuthenticated, getOrderDetails)
    .put(isAuthenticated, isAdmin, processOrder)

export default router