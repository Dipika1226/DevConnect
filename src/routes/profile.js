const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateProfileUpdateData } = require("../utils/validation");
const bcrypt = require("bcrypt")
//get profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user)
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        const canItBeUpdated = validateProfileUpdateData(req);
        if (!canItBeUpdated) {
            throw new Error("cannot be updated");
        }
        const loggedInUser = req.user;
        Object.keys(req.body).forEach((key) => { loggedInUser[key] = req.body[key] });
        await loggedInUser.save();
        res.json({
            message: `${loggedInUser.firstName} your profile updated successfully`,
            data: loggedInUser
        })
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
})
profileRouter.patch("/profile/update/password", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const password = req.body.password;
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            throw new Error("wrong password");
        }
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        user.password = hashedPassword;
        console.log(hashedPassword)
        await user.save();
        res.send("Password updated successfully");
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
})
module.exports = profileRouter;