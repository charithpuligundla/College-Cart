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
          enum: ["pending", "accepted", "deliveredA","deliveredB", "cancelled"],
          default: "pending"
        },
    totalAmount: {
      type: Number,
      required: true
    },
    amountToPay:{
      type:Number,
      default:0
    },
    deliveryFee:{
      type:Number,
      default:0
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
    ispremium:{
      type:Boolean,
      default:false
    }
  }, 
  { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
