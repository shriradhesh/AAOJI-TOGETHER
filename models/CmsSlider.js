
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const cmsSliderSchema = new Schema({
  
    title : {
    type : String,
    
    },

    heading : {               			
    type : String ,
     
    },

    description: {
    type : String ,    
    },
    
    images: {
        type : String
      },
      
      
} , { timestamps: true } )
const cmsSliderModel = mongoose.model('cmsSliderModel', cmsSliderSchema)

module.exports = cmsSliderModel