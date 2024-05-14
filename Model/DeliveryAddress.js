const mongoose = require("mongoose");

const DeliveryAddressSchema = new mongoose.Schema({
    doorno: Number,
    street: String,
    city: String,
    state: String,
    pincode: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    order : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }
});

module.exports = mongoose.model("DAddress", DeliveryAddressSchema);
