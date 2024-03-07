
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const cmsPhoneSchema = new Schema({
   
    phone_no1: {
        type: Number,
    },

    phone_no2 : {               			
    type : Number ,
     },

    
      
      
} , { timestamps: true } )
const cmsPhoneModel = mongoose.model('cmsPhoneModel', cmsPhoneSchema)

module.exports = cmsPhoneModel