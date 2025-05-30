const { validateSignUp } = require("../utils/validation");
const bcrypt = require("bcrypt");
const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
authRouter.post("/signup", async (req, res) => {
    try {
        //validation of data
        validateSignUp(req.body);
        const { firstName, lastName, emailId, password, skills, about, photoURL, gender, age } = req.body;
        //encrypt the data
        const hashedPassword = await bcrypt.hash(password, 10);//10 is decent/standard rounds of salt

        //creating new instance of User model
        // const user = new User(req.body);
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            skills,
            about,
            photoURL,
            gender,
            age
        });

        if (skills && req.body?.skills.length > 15) {
            throw new Error("More than 15 skills are not allowed");
        }

        const savedUser = await user.save()//for saving user to db
        const token = await savedUser.createJWT();
        // res.cookie("token", token, { expires: new Date(Date.now() + 7 * 24 * 3600000) });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            expires: new Date(Date.now() + 7 * 24 * 3600000) // 7 days
        });

        res.json({ message: "user added successfully to DB", savedUser });
    }
    catch (err) {
        res.status(400).send("Error while adding user to DB:" + err.message);
    }
})

//login api
authRouter.post("/login", async (req, res) => {
    const { emailId, password } = req.body;
    try {
        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await user.validatePassword(password);
        if (isPasswordValid) {
            //create jwt token
            const token = await user.createJWT();
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,           // Must be true in production (HTTPS)
                sameSite: "None",
                expires: new Date(Date.now() + 7 * 24 * 3600000)
            });
            res.send(user);
        }
        else {
            throw new Error("Invalid credentials");
        }
    }
    catch (err) {
        res.status(400).send("ERROR:" + err.message);
    }
})
authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now())
    })
    res.send("logged out successfully");
})
module.exports = authRouter;