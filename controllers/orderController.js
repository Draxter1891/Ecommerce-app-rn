import { orderModel } from "../models/orderModel.js"
import { productModel } from "../models/productModel.js"
import { stripe } from "../server.js"

//CREATE ORDERS
export const createOrderController = async (req, res) => {
    try {
        const { shippingInfo, orderItems, paymentMethod, paymentInfo, itemPrice, tax, shippingCharges, totalAmount, } = req.body
        //validation
        if (!shippingInfo || !orderItems || !itemPrice || !tax || !shippingCharges || !totalAmount) {
            return res.status(404).send({
                success: false,
                message: 'please provide all fields'
            })
        }

        //create order
        await orderModel.create({
            user: req.user._id,
            shippingInfo,
            orderItems,
            paymentMethod,
            paymentInfo,
            itemPrice,
            tax,
            shippingCharges,
            totalAmount,
        })

        //stock update
        for (let i = 0; i < orderItems.length; i++) {
            //find product
            const product = await productModel.findById(orderItems[i].product)
            product.stock -= orderItems[i].quantity
            await product.save()
        }
        res.status(201).send({
            success: true,
            message: 'order placed successfully'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in create order api',
            error
        })
    }
}

//GET ORDERS
export const getOrdersController = async (req, res) => {
    try {
        //find orders
        const orders = await orderModel.find({ user: req.user._id })

        //validation
        if (!orders) {
            return res.status(404).send({
                success: false,
                message: 'No order found'
            })
        }

        res.status(200).send({
            success: true,
            message: 'Your orders data',
            totalOrders: orders.length,
            orders
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in get order api',
            error
        })
    }
}

//GET SINGLE ORDER
export const getSingleOrderController = async (req, res) => {
    try {
        //find order
        const order = await orderModel.findById(req.params.id)

        //validation
        if (!order) {
            return res.status(404).send({
                success: false,
                message: 'No order found'
            })
        }
        res.status(200).send({
            success: true,
            message: 'Your order fetched',
            order
        })
    } catch (error) {
        console.log(error)
        //cast error  || OBJECT ID
        if (error.name === 'CastError') {
            return res.status(500).send({
                success: false,
                message: 'invalid ID',
            })
        }
        res.status(500).send({
            success: false,
            message: 'Error in get single order Api',
            error
        })
    }
}

//ACCEPT PAYMENT
export const paymentController = async (req, res) => {
    try {
        //get amount
        const { totalAmount } = req.body
        //validation
        if (!totalAmount) {
            return res.status(404).send({
                success: false,
                message: 'Total amount is required'
            })
        }
        const { client_secret } = await stripe.paymentIntents.create({
            amount: Number(totalAmount * 100),
            currency: 'usd',

        })
        res.status(200).send({
            success: true,
            client_secret
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in payment Api',
            error
        })
    }
}

//ADMIN SECTION

//get all orders
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.status(200).send({
            success: false,
            message: 'All orders data',
            totalOrders: orders.length,
            orders,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in get-all-orders api of Admin section',
            error
        })
    }
}

//change order status
export const changeOrderStatusController = async (req, res) => {
    try {
        //find order
        const order = await orderModel.findById(req.params.id)
        //validation
        if (!order) {
            return res.status(404).send({
                success: false,
                message: 'order not found'
            })
        }
        if (order.orderStatus === 'processing') order.orderStatus = 'shipped'
        else if (order.orderStatus === 'shipped') {
            order.orderStatus = 'delivered'
            order.deliveredAt = Date.now()
        } else {
            return res.status(500).send({
                success: false,
                message: 'order already delivered'
            })
        }
        await order.save()
        res.status(200).send({
            success: true,
            message: 'order status updated successfully'
        })

    } catch (error) {
        console.log(error)
        //cast error  || OBJECT ID
        if (error.name === 'CastError') {
            return res.status(500).send({
                success: false,
                message: 'invalid ID',
            })
        }
        res.status(500).send({
            success: false,
            message: 'Error in change-order api of Admin section',
            error
        })
    }
}