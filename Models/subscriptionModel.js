const mongoose = require("mongoose");
const { Schema } = mongoose;

const subscribeSchema = new Schema({
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "manager",
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 0,
    },
});

module.exports = mongoose.model("subscribe", subscribeSchema);
