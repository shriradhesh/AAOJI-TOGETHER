
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const cmsAboutfesta_schema = new Schema({
  
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
        type : [String]
      },
    video : {
          type : String
    }
      
} , { timestamps: true } )
const cmsAboutfesta_Model = mongoose.model('cmsAboutfesta_Model', cmsAboutfesta_schema)

module.exports = cmsAboutfesta_Model