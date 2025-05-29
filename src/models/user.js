const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
require('dotenv').config();
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
    },
    lastName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email:" + value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Not stong enough,enter a strong password" + value);
            }
        }
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        // validate(value) {
        //     if (!['male', 'female', 'others'].includes(value)) {
        //         throw new Error("Gender data is not valid")
        //     }
        // }
        enum: {
            values: ["male", "female", "others"],
            message: `{VALUE} is not a valid gender`
        }
    },
    skills: {
        type: [String],
    },
    about: {
        type: String,
        default: "This is default about",
        maxLength: 200,
    },
    photoURL: {
        type: String,
        default: "https://img.icons8.com/?size=100&id=81139&format=png&color=000000",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Not a valid URL");
            }
        }
    }
}, { timestamps: true });
userSchema.methods.createJWT = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
};
userSchema.methods.validatePassword = async function (passwordEnteredByUser) {
    const user = this;
    const hashedPassword = user.password;
    const isPasswordValid = await bcrypt.compare(passwordEnteredByUser, hashedPassword);
    return isPasswordValid;
}
module.exports = mongoose.model("User", userSchema);