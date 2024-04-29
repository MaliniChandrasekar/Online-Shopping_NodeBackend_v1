const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    productname: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }, 
    categoryname: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
