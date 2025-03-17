const validator = require("validator");
const validateSignUp = ({ firstName, lastName, emailId, password }) => {
    //although the validations i am doing here is already written in schema validation but this is just for example that this is how we will validate the things which are needed to be validated
    if (!(firstName || lastName)) {
        throw new Error("Name is not valid,please write a valid name");
    }
    else if (!validator.isEmail(emailId)) {
        throw new Error("Invalid emailid");
    }
    else if (!validator.isStrongPassword(password)) {
        throw new Error("please write a strong password")
    }
}
const validateProfileUpdateData = (req) => {
    const allowedUpdates = ["firstName", "lastName", "skills", "about", "photoURL", "gender", "age"]
    return Object.keys(req.body).every((field) => { return allowedUpdates.includes(field) })
}
module.exports = {
    validateSignUp,
    validateProfileUpdateData
}