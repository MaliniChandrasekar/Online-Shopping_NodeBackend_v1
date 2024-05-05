const mongoose = require('mongoose');


const wishSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference to the User model
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product' // Reference to the Product model
        }
    }]
});

module.exports = mongoose.model('Wish', wishSchema);

