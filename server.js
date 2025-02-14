import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'
import cloudinary from 'cloudinary'
import Stripe from 'stripe'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'


//dot env config (always must be on top of others)
dotenv.config();


//db connection
connectDB();

//stripe config
export const stripe = new Stripe(process.env.STRIPE_API_SECRET)


//cloudinary config
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

//rest object because we can't use express as it is, we need to make a copy of express to access its functionality
const app = express()


//middlewares
app.use(helmet());
app.use(mongoSanitize());
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(cookieParser());


//routes import
import testRoutes from './routes/testRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

//route
app.use('/api/v1', testRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/product', productRoutes)
app.use('/api/v1/category', categoryRoutes)
app.use('/api/v1/order', orderRoutes)


app.get('/', (req, res) => {
    return res.status(200).send("<h1>Welcome to Node Server.</h1>");
});


//port 
const PORT = process.env.PORT || 8000;
//listen
app.listen(PORT, () => {
    console.log(`Server Running on port number ${PORT} on ${process.env.NODE_ENV} mode`.bgMagenta.white);
});