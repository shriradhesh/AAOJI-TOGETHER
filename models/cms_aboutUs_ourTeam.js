
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const cmsOurTeam = new Schema({
   
    heading: {
        type: String,
    },

    description : {               			
    type : String ,
     },

    
      
      
} , { timestamps: true } )
const cmsOurTeamModel = mongoose.model('cmsOurTeamModel', cmsOurTeam)

module.exports = cmsOurTeamModel