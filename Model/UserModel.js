var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstname : {type : String, required : true},
    lastname : {type : String, required : true},
    password : {type : String, required : true},
    email : {type : String, required : true},
    city : {type : String, required : true},
    role : {type : String, default : "user"}
    // likes : {type : Number, required : true, default : 0.0}
}, {timestamps : true});

module.exports = mongoose.model("User", UserSchema)