const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();
const User = require("../models/user")
const USER_SAFE_DATA = "firstName lastName age about skills photoURL"
//Api to get pending requests
userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", USER_SAFE_DATA)
        // }).populate("fromUserId",["firstName", "lastName", "age", "about", "skills", "photoURL"]) other way of writing
        res.json({
            message: "Connection requests fetched successfully",
            data: connectionRequests
        })
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
})
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connections = await ConnectionRequest.find({
            $or: [{ fromUserId: loggedInUser, status: "accepted" },
            { toUserId: loggedInUser, status: "accepted" }]
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA)
        const data = connections.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        })
        res.json({ message: "Connections fetched successfully", data })
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});
//feed API
userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;
        const loggedInUser = req.user;
        const connectionrequests = await ConnectionRequest.find({
            $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }]
        }).select("fromUserId toUserId");
        const hideUsersFromFeed = new Set()
        connectionrequests.forEach((req) => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        })
        const usersToBeShownOnFeed = await User.find({
            $and: [{ _id: { $nin: Array.from(hideUsersFromFeed) } },//function to convert set into an array
            { _id: { $ne: loggedInUser._id } }]
        }).select(USER_SAFE_DATA).skip(skip).limit(limit)
        res.send(usersToBeShownOnFeed)
    }
    catch (err) {
        res.status(400).send({ message: err.message });
    }
})
module.exports = userRouter;