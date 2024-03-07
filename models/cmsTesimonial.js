
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const cmsTestimonialSchema = new Schema({
    
    userName: {
        type: String,
    },

    heading : {               			
    type : String ,
     },
    description: {
    type : String ,    
    },
    
    user_image: {
        type : String
      },
      
      
} , { timestamps: true } )
const cmsTestimonialModel = mongoose.model('cmsTestimonialModel', cmsTestimonialSchema)

module.exports = cmsTestimonialModel