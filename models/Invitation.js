const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvitedeventSchema = new Schema({
  hostId: {
    type: Schema.Types.ObjectId,
    ref: "userModel",
  },
  hostName : {
    type : String
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
  },
  adminName : {
    type : String
  },
  
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "eventModel",
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
  co_hosts: [
    {
      co_host_Name: {
        type: String
      },
      phone_no: {
        type: Number
      }
    },
  ],
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
      }
    },
  ],
  images: {
    type: [String],
    required: true,
  },

  event_status: {
    type: String,
    enum: ["invited" , "created"],    
    default : "invited"
  },

  venue_Date_and_time: [
    
    {
      sub_event_title : 
      {
        type : String
      },
      
      venue_Name: {
        type: String,
       
      },
      venue_location: {
        type: String,
        
      },
      date: {
        type: Date,
        required: true,
      },
      start_time: {
        type: String,
       
      },
      end_time: {
        type: String,       
      },
      venue_status : {
        type : Number ,
        enum : [0,1,2,3],       //pending , accept , reject , maybe 
       default : 0         // pending
      }
    }
  ],
}, { timestamps: true });

const InvitedeventModel = mongoose.model('InvitedeventModel', InvitedeventSchema);

module.exports = InvitedeventModel;
