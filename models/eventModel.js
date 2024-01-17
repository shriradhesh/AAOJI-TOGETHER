const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "userModel",
  },
  userName : {
    type : String
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
  },
  adminName : {
    type : String
  },
  title: {
    type: String,
   
  },
  description: {
    type: String,
   
  },
  event_Type: {
    type: String,
    enum: ['Business_Conference', 'Music_Festivals', 'Birthday', 'Exhibitions', 'Wedding_Anniversary', 'Sports', 'marriage' ,'Demo' , 'Marriage'],
   
  },
  co_hosts: [
    {
      co_host_Name: {
        type: String
      },
      phone_no: {
        type: String
      }
    },
  ],
  Guests: [
    {
      Guest_Name: {
        type: String
      },
      phone_no: {
        type: String
      },
      status: {
        type: Number,
        enum: [0, 1],
        default: 0 
      }
    },
  ],
  images: {
    type: [String],
    
  },
  event_key : {
    type : Number
  },

  event_status: {
    type: Number,
    enum: [0,1],    
    default :1
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
        type: String,
      
      },
      start_time: {
        type: String,
       
      },
      end_time: {
        type: String,
        
      },
    }
  ],
}, { timestamps: true });

const eventModel = mongoose.model('eventModel', eventSchema);

module.exports = eventModel;
