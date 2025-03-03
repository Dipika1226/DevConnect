const mongoose = require("mongoose");
const connectDB = async () => {
    await mongoose.connect("mongodb+srv://itzdipikamishra:TtigvVhtkudGin5N@cluster0.yfpbb.mongodb.net/DevConnect");
}
module.exports = connectDB
