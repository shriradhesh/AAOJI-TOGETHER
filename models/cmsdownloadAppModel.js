
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const cmsDownloadAppSchema = new Schema({ 
 

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
const cmsDownloadAppModel = mongoose.model('cmsDownloadAppModel', cmsDownloadAppSchema)

module.exports = cmsDownloadAppModel