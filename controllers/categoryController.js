import { categoryModel } from "../models/categoryModel.js"
import { productModel } from '../models/productModel.js'

//CREATE CATEG
export const createCategoryController = async (req, res) => {
    try {
        const { category } = req.body;
        //validation
        if (!category) {
            return res.status(404).send({
                success: false,
                message: 'please provide category name'
            })
        }

        await categoryModel.create({ category })
        res.status(201).send({
            success: true,
            message: `${category} category created successfully`
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'error in create category api'
        })
    }
}

//GET ALL CATEGORY
export const getAllCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.find({})
        res.status(200).send({
            success: true,
            message: 'categories fetched successfully',
            total: category.length,
            category
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'error in get-all category api'
        })
    }
}

//DELETE CATEGORY
export const deleteCategoryController = async (req, res) => {
    try {
        //find category
        const category = await categoryModel.findById(req.params.id)
        //validation
        if (!category) {
            return res.status(404).send({
                success: false,
                message: 'category not found'
            })
        }
        //find product with category id
        const products = await productModel.find({ category: category._id })
        //update product category
        for (let i = 0; i < products.length; i++) {
            const product = products[i]
            product.category = undefined
            await product.save()
        }
        //save
        await category.deleteOne()
        res.status(200).send({
            success: true,
            message: 'category deleted successfully'
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
            message: 'Error in delete category Api',
            error
        })
    }
}

//UPDATE CATEGORY
export const updateCategoryController = async (req, res) => {
    try {
        //find category
        const category = await categoryModel.findById(req.params.id)

        //validation
        if (!category) {
            return res.status(404).send({
                success: false,
                message: 'category not found'
            })
        }
        //get new category
        const { updatedCategory } = req.body

        //find product with category id
        const products = await productModel.find({ category: category._id })

        //update product category
        for (let i = 0; i < products.length; i++) {
            const product = products[i]
            product.category = updatedCategory;
            await product.save()
        }
        if (updatedCategory) category.category = updatedCategory;
        //save
        await category.save({ category: updatedCategory })
        res.status(200).send({
            success: true,
            message: 'category updated successfully'
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
            message: 'Error in update category Api',
            error
        })
    }
}