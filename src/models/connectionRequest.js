const mongoose = require("mongoose");
const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: {
            values: ["interested", "ignored", "accepted", "rejected"],
            message: `{VALUE} is not a valid status`
        }
    }
}, { timestamps: true });
//compound index
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });//helpful for queries like connectionRequest.find({fromUserId:5647689909gf,toUserId:56321245688ug})
connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;
    if (connectionRequest.toUserId.equals(connectionRequest.fromUserId)) {
        throw new Error("you cannot send connection request to yourself")
    }
    next();
})
const ConnectionRequestModel = mongoose.model("ConnectionRequest", connectionRequestSchema);
module.exports = ConnectionRequestModel
