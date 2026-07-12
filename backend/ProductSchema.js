const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: String,

    brand: String,

    type: String,

    subcategory: String,

    category: String,

    weight: String,

    mrp: Number,

    image_url: String
},{
    timestamps:true
});

module.exports = mongoose.model("Product", ProductSchema);