import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import JWT from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required!']
    },
    email: {
        type: String,
        require: [true, 'email is required!'],
        unique: [true, 'email is already taken!']
    },
    password: {
        type: String,
        require: [true, 'password is required!'],
        minLength: [6, 'password length should be greater than 6 characters']
    },
    address: {
        type: String,
        require: [true, 'address is required!'],
    },
    city: {
        type: String,
        require: [true, 'city name is required!'],
    },
    country: {
        type: String,
        require: [true, 'country name is required!'],
    },
    phone: {
        type: String,
        require: [true, 'phone number is required']
    },
    profilePic: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    answer: {
        type: String,
        required: [true, 'answer is required']
    },
    role: {
        type: String,
        default: 'user',
    }
}, { timestamps: true });

//functions
//hash func
userSchema.pre('save', async function (next) {
    // this prevents the unchanged password being hashed twice
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10);
});

//compare func
userSchema.methods.comparePassword = async function (plainPswd) {
    return await bcrypt.compare(plainPswd, this.password)
};

//JWT token
userSchema.methods.generateToken = function () {
    return JWT.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

export const User = mongoose.model("Users", userSchema);