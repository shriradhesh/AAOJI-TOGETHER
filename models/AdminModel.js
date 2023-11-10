const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, 
        trim: true, 
        lowercase: true, 
        match: /^\S+@\S+\.\S+$/, 
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: '',
    },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
