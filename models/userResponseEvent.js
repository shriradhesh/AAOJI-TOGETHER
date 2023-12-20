const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userResponseEventSchema = new Schema({
  hostId: {
    type: Schema.Types.ObjectId,
    ref: "userModel",
  },
  hostName : {
    type : String
  },
  InvitedEventId: {
    type: Schema.Types.ObjectId,
    ref: "InvitedeventModel",
  },
  event_title: {
    type: String,
   
  },
  event_description: {
    type: String,   
  },
  event_Type: {
    type: String,    
  },

  Guests: [
    {
        Guest_Name: {
              type: String
         },
      phone_no: {
              type: Number
      },

      guest_status: {
            type: Number,
            enum: [0, 1],      // accepted , rejected
            default: 0 // accepted
      }, 
      venue_Name: {
            type: String,
          },      
     venue_status : {
            type : Number ,
            enum : [0,1,2,3],       //pending , accept , reject , maybe 
            default : 0         // pending
        }
      }
    
  ],

  images: {
    type: [String],
    required: true,
  }, 

  
}, { timestamps: true });

const userResponseEventModel = mongoose.model('userResponseEventModel', userResponseEventSchema);

module.exports = userResponseEventModel;
