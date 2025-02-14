import express from 'express'
import { isAdmin, isAuth } from '../middlewares/authMiddleware.js';
import { changeOrderStatusController, createOrderController, getAllOrdersController, getOrdersController, getSingleOrderController, paymentController } from '../controllers/orderController.js';


const router = express.Router()

//routes
//CREATE ORDERS
router.post('/create', isAuth, createOrderController)


//GET ALL ORDERS
router.get('/my-orders', isAuth, getOrdersController)


//GET SINGLE ORDER
router.get('/my-orders/:id', isAuth, getSingleOrderController)

//ACCEPT PAYMENT
router.post('/payment', isAuth, paymentController)

//ADMIN PART
//get all orders
router.get('/admin/get-all-orders', isAuth, isAdmin, getAllOrdersController)
//change order status
router.put('/admin/order/:id', isAuth, isAdmin, changeOrderStatusController)
export default router;