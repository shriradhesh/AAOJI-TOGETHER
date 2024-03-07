
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const cmsOurMissionAndVision = new Schema({
   
    our_mission: {
        type: String,
    },

    our_vision : {               			
    type : String ,
     },

    
      
      
} , { timestamps: true } )
const cmsOurMissionAndVisionModel = mongoose.model('cmsOurMissionAndVisionModel', cmsOurMissionAndVision)

module.exports = cmsOurMissionAndVisionModel