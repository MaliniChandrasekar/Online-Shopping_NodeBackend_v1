const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
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
        price: {
            type: Number,
            default: 0
        },
        date : {
            type : Number,
            default : Date.now
        }
    }],
    deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DAddress' // Reference to the DeliveryAddress model
    }
});

module.exports = mongoose.model('Order', OrderSchema);
