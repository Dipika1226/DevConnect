const express = require("express");
const app = express();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const cors = require("cors");

app.use(cors({
    origin: 'https://dev-connect-web-eight.vercel.app',
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", profileRouter);
app.use("/", authRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
connectDB()
    .then(() => {
        console.log("database connection established successfully..");
        app.listen(3000, () => {
            console.log("server successfully running on port 3000");
        })
    })
    .catch((err) => {
        console.error("Database cannot be connected" + err.message);
    })