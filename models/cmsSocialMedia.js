
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const cmssocialMediaSchema = new Schema({
   
    facebook: {
        type: String,
    },

    instagram : {               			
    type : String ,
     },

    linkedIn: {
    type : String ,    
    },

    linkedIn: {
    type : String ,    
    },

    twitter: {
    type : String ,    
    },
    
    whatsapp: {
        type : String
      },
      
      
} , { timestamps: true } )
const cmssocialMediaModel = mongoose.model('cmssocialMediaModel', cmssocialMediaSchema)

module.exports = cmssocialMediaModel