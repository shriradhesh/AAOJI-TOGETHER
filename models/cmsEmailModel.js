
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const cmsEmailchema = new Schema({
   
    email1: {
        type: String,
    },

    email2 : {               			
    type : String ,
     },

    
      
      
} , { timestamps: true } )
const cmsEmaiModel = mongoose.model('cmsEmaiModel', cmsEmailchema)

module.exports = cmsEmaiModel