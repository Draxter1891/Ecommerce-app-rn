import cloudinary from 'cloudinary'
import { productModel } from '../models/productModel.js'
import { getDataUri } from '../utils/features.js'

//GET ALL PRODUCTS
export const getAllProductsController = async (req, res) => {

    const { keyword, category } = req.query

    try {
        const products = await productModel.find({
            name: {
                $regex: keyword ? keyword : '',
                $options: "i",
            },

            // category: category ? category : undefined
        }).populate('category')
        res.status(200).send({
            success: true,
            message: 'all product fetched successfully',
            totalProducts: products.length
            , products
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in get-all Product Api',
            error
        })
    }
}

//GET TOP PRODUCT
export const getTopProductController = async (req,res) =>{
    try {
        //find product 
        //NOTE: rating:-1 means only show top products
        const products = await productModel.find({}).sort({rating:-1}).limit(3)

        res.status(200).send({
            success:true,
            message: 'top 3 products',
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in get-top Products Api',
            error
        })
    }
}
//GET SINGLE PRODUCT 
export const getSingleProductController = async (req, res) => {
    try {
        //get product id
        const product = await productModel.findById(req.params.id)
        //validation
        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'product not found'
            })
        }

        res.status(200).send({
            success: true,
            message: 'product found',
            product,
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
            message: 'Error in get-single Product Api',
            error
        })
    }
}

//CREATE PRODUCT
export const createProductController = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body

        //validation
        // if(!name || !description || !price || !category || !stock){
        //     return res.status(500).send({
        //         success:false,
        //         message: 'Please provide all fields'
        //     })
        // }
        //image validation
        if (!req.file) {
            return res.status(500).send({
                success: false,
                message: 'please provide product images'
            })
        }

        const file = getDataUri(req.file)
        const cdb = await cloudinary.v2.uploader.upload(file.content)
        const image = {
            public_id: cdb.public_id,
            url: cdb.secure_url,
        }
        await productModel.create({
            name, description, price, category, stock, images: [image]
        })

        res.status(201).send({
            success: true,
            message: 'product created successfully'
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in create Product Api',
            error
        })
    }
}

//UPDATE PRODUCT
export const updateProductController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id)
        //validation
        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'product not found'
            })
        }
        const { name, description, price, stock, category } = req.body

        //validate and update 
        if (name) product.name = name
        if (description) product.description = description
        if (price) product.price = price
        if (stock) product.stock = stock
        if (category) product.category = category

        await product.save()
        res.status(200).send({
            success: true,
            message: 'product details updated'
        })

    } catch (error) {
        // console.log(req.body)
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
            message: 'Error in update Product Api',
            error
        })
    }
}

//UPDATE PRODUCT IMAGE
export const updateProductImageController = async (req, res) => {
    try {
        //find product
        const product = await productModel.findById(req.params.id)
        //validation
        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'product not found'
            })
        }

        //file validation
        if (!req.file) {
            return res.status(404).send({
                success: false,
                message: 'product image not found'
            })
        }

        const file = getDataUri(req.file)
        const cdb = await cloudinary.v2.uploader.upload(file.content)
        const image = {
            public_id: cdb.public_id,
            url: cdb.secure_url
        }

        //save
        product.images.push(image)
        await product.save()

        res.status(200).send({
            success: true,
            message: 'image uploaded successfully'
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
            message: 'Error in update image Api',
            error
        })
    }
}

//DELETE PRODUCT IMAGE
export const deleteProductImageController = async (req, res) => {
    try {
        //find product
        const product = await productModel.findById(req.params.id)
        //validation
        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'product not found'
            })
        }

        //find image id
        const id = req.query.id
        if (!id) {
            return res.status(404).send({
                success: false,
                message: 'product image not found'
            })
        }

        let isExist = -1;
        product.images.forEach((item, index) => {
            if (item._id.toString() === id.toString()) isExist = index;
        })

        if (isExist < 0) {
            return res.status(404).send({
                success: false,
                message: 'Image not found'
            })
        }

        //delete product image
        await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
        product.images.splice(isExist, 1);
        await product.save();

        return res.status(200).send({
            success: true,
            message: 'product image deleted successfully'
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
            message: 'Error in delete image Api',
            error
        })
    }
}

//DELETE PRODUCT
export const deleteProductController = async (req, res) => {
    try {
        //find
        const product = await productModel.findById(req.params.id);

        //validation
        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'product not found'
            })
        }

        //find and delete image from cloudinary
        for (let index = 0; index < product.images.length; index++) {
            await cloudinary.v2.uploader.destroy(product.images[index].public_id);
        }
        await product.deleteOne();
        res.status(200).send({
            success: true,
            message: 'product deleted successfully'
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
            message: 'Error in delete product Api',
            error
        })
    }
}

//CREATE PRODUCT REVIEW AND COMMENT
export const productReviewController = async (req, res) => {
    try {
        const { comment, rating } = req.body

        //find product
        const product = await productModel.findById(req.params.id)
        //check previous review
        const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString())
        if (alreadyReviewed) {
            return res.status(400).send({
                success: false,
                message: 'product already reviewed'
            })
        }
        // review object
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id
        }
        //passing review object to reviews array
        product.reviews.push(review)
        //number of reviews
        product.numReviews = product.reviews.length
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

        //save
        await product.save()
        res.status(200).send({
            success: true,
            message: 'review added'
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
            message: 'Error in review and comment Api',
            error
        })
    }
}