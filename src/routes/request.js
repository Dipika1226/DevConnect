const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const requestRouter = express.Router();
//sendConnectionRequest api
requestRouter.post("/request/send/:status/:userId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.userId;
        const status = req.params.status;
        const allowedStatus = ["interested", "ignored"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: status + " is not a valid status" });
        }
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).send("User not found");
        }
        const existingConnectionRequest = await ConnectionRequest.findOne({ $or: [{ fromUserId, toUserId }, { fromUserId: toUserId, toUserId: fromUserId }] });
        if (existingConnectionRequest) {
            return res.status(400).json({ message: "connection request already exists" })
        }
        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        })
        const data = await connectionRequest.save();
        res.json({
            message: "connection request sent successfully",
            data
        })
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
})
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;
        const allowedStatus = ["accepted", "rejected"]
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "not a valid status:" + status })
        }
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,//requestId should exist
            toUserId: loggedInUser._id,//the user who have received requests should be loggedIn
            status: "interested"//once the user has been ignored or rejected it cannot be reversed
        })
        if (!connectionRequest) {
            return res.status(404).json("no such connection request found");
        }
        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.json({ message: "Connection request has been " + status, data });
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
})
module.exports = requestRouter;