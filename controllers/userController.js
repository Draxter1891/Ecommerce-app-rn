import { User } from "../models/userModel.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from 'cloudinary'

//REGISTER
export const registerController = async (req, res) => {
    try {
        const { name, email, password, address, city, country, phone, answer } = req.body
        //validation
        if (!name || !email || !password || !address || !city || !country || !phone || !answer) {
            return res.status(500).send({
                success: false,
                message: "Please provide all Fields!"
            });
        }

        //check existing user
        const existingUser = await User.findOne({ email });
        //validation
        if (existingUser) {
            return res.status(500).send({
                success: false,
                message: "email already taken!"
            })
        }

        const user = await User.create({
            name,
            email,
            password,
            address,
            city,
            country,
            phone,
            answer
        });
        res.status(201).send({
            success: true,
            message: 'Registration success, please login',
            user,
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Register API',
            error
        })
    }
};

//LOGIN
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body
        //validation
        if (!email || !password) {
            return res.status(500).send({
                success: false
                , message: "Please add email and password"
            })
        }

        //check user
        const user = await User.findOne({ email })
        //user validation
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User Not Found"
            })
        }
        //check pass
        const isMatch = await user.comparePassword(password)
        //validation pass
        if (!isMatch) {
            return res.status(500).send({
                success: false,
                message: "invalid credentials"
            })
        }

        const token = user.generateToken();

        res.status(200).cookie("token", token, {
            expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            secure: process.env.NODE_ENV === 'development' ? true : false,
            httpOnly: process.env.NODE_ENV === 'development' ? true : false,
            sameSite: process.env.NODE_ENV === 'development' ? true : false,
        }).send({
            success: true,
            message: "Login Successful",
            token,
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false
            , message: "Error in Login API"
            , error
        })
    }

}

//Get USER PROFILE
export const getUserProfileController = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.password = undefined;
        res.status(200).send({
            success: true,
            message: 'User Profile fetched successfully',
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Profile Api'
        })
    }
}

//LOGOUT
export const logoutController = async (req, res) => {
    try {
        res.status(200).cookie("token", "", {
            expires: new Date(Date.now()),
            secure: process.env.NODE_ENV === 'development' ? true : false,
            httpOnly: process.env.NODE_ENV === 'development' ? true : false,
            sameSite: process.env.NODE_ENV === 'development' ? true : false,
        }).send({
            success: true,
            message: 'Logout successfully'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Logout Api'
        })
    }
}

//UPDATE USER PROFILE
export const updateProfileController = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { name, email, address, city, country, phone } = req.body
        //validation + update
        if (name) user.name = name
        if (email) user.email = email
        if (address) user.address = address
        if (city) user.city = city
        if (country) user.country = country
        if (phone) user.phone = phone

        //save user
        await user.save()
        res.status(200).send({
            success: true,
            message: 'User prodile updated'
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Profile Updation Api',
            error
        })
    }
}

//UPDATE USER PASSWORD
export const updatePasswordController = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);
        const { oldPassword, newPassword } = req.body
        //validation
        if (!oldPassword || !newPassword) {
            return res.status(500).send({
                success: false,
                message: 'Please provide old or new password'
            })
        }

        //old pass chk
        const isMatch = await user.comparePassword(oldPassword)

        //validation
        if (!isMatch) {
            return res.status(500).send({
                success: false,
                message: 'Invalid old password'
            })
        }

        user.password = newPassword
        await user.save()
        res.status(200).send({
            success: true,
            message: 'Password updated successfully'
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Password Updation Api',
            error
        })
    }

}

//UPDATE PROFILE PICTURE
export const updateProfilePicController = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        //get file from user
        const file = getDataUri(req.file)
        //delete previous image (make sure it exists in your database!)
        await cloudinary.v2.uploader.destroy(user.profilePic.public_id)
        //udate cdb = cloudinary database
        const cdb = await cloudinary.v2.uploader.upload(file.content)
        user.profilePic = {
            public_id: cdb.public_id,
            url: cdb.secure_url
        }

        //save function
        await user.save()

        res.status(200).send({
            success: true,
            message: 'profile picture updated'
        })


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Update Profile Pic Api',
            error
        })
    }
}

// FORGOT PASSWORD
export const passResetController = async (req, res) => {
    try {
        //get user email & newPassword & answer
        const { email, newPassword, answer } = req.body
        //validation
        if (!email || !newPassword || !answer) {
            return res.status(500).send({
                success: false,
                message: 'please provide all fields'
            })
        }

        //find user & answer
        const user = await User.findOne({ email, answer })
        //vallidation
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'invalid user or answer'
            })
        }
        //updation
        user.password = newPassword
        await user.save()

        res.status(200).send({
            success: true,
            message: 'your password has been reset, please login!'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in forgot password Api',
            error
        })
    }
}