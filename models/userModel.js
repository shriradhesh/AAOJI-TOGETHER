const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    fullName :
    {
        type : String,
        required : true
    },

    phone_no : 
    {
        type : Number,
        required : true
    },
    profileImage :
    {
        type: String,
        default: '',
    },
    
    
}, {timestamps: true})


const userModel = mongoose.model('userModel', userSchema);

module.exports = userModel