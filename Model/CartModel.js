const mongoose = require('mongoose');
// const User = require("./UserModel")
// const Product = require("./ProductModel")

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference to the User model
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product' // Reference to the Product model
        },
        quantity: {
            type: Number,
            default: 1
        }, 
        price : {
            type : Number,
            default : 0
        }
    }]
});

module.exports = mongoose.model('Cart', cartSchema);

