const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    doorno: Number,
    street: String,
    city: String,
    state: String,
    pincode: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model("Address", AddressSchema);
