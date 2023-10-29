const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema({
  // userId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     required: true,
  //     ref: "user",
  // },
  // managerId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     required: true,
  //     ref: "manager",
  // },
  // bookingId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     required: true,
  //     ref: "bookingData",
  // },
  userId: {
    type: String,
    required: true,
  },
  managerId: {
    type: String,
    required: true,
  },
  bookingId: {
    type: String,
    ref: "bookingData",
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("transaction", transactionSchema);
