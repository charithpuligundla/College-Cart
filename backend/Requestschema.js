const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    description: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required:true
    },
    status: {
          type: String,
          enum: ["pending", "accepted", "delivered", "cancelled"],
          default: "pending"
        },
    totalAmount: {
      type: Number,
      required: true
    },
    rejected:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      default: null
    },
    requested: [
      {
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        description:  { type: String, required: true },
      }
    ],
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  }, 
  { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
