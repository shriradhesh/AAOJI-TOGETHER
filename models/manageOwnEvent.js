
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const manageOwnEventSchema = new Schema({ 
 

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
const manageOwnEventModel = mongoose.model('manageOwnEventModel', manageOwnEventSchema)

module.exports = manageOwnEventModel