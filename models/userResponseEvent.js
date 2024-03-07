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
  eventId: {
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
        status: {
          type: Number,
          enum: [0, 1 , 2 ,3],       // 0 = accept , 1 for reject , 2 for pending , 3 for may be
          default: 2     
        },
          venue : [
            {
              sub_event_Id : {
                type : String
              },
              sub_event_title: {
                type: String,
              },      
              venue_status : {
                type : Number ,
                enum : [0,1,2,3],       // 1 accept , 0 reject  , 2 for maybe
                default : 0         
            },
            },
          ]
           
      }    
  ],

  images: {
    type: [String],
    required: true,
  }, 

  
}, { timestamps: true });

const userResponseEventModel = mongoose.model('userResponseEventModel', userResponseEventSchema);

module.exports = userResponseEventModel;
