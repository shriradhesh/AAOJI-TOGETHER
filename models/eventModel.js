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
    required: true
  },
  description: {
    type: String,
    required: true
  },
  event_Type: {
    type: String,
    enum: ['Business_Conference', 'Music_Festivals', 'Birthday', 'Exhibitions', 'Wedding_Anniversary', 'sports', 'marriage' ,'Demo' , 'Marriage'],
    required: true
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
        enum: [0, 1],
        default: 0 
      }
    },
  ],
  images: {
    type: [String],
    required: true,
  },

  event_status: {
    type: Number,
    enum: [0,1],    
    default :1
  },

  venue_Date_and_time: [
    {
      venue_Name: {
        type: String,
        required: true,
      },
      venue_location: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      start_time: {
        type: String,
        required: true,
      },
      end_time: {
        type: String,
        required: true
      },
    }
  ],
}, { timestamps: true });

const eventModel = mongoose.model('eventModel', eventSchema);

module.exports = eventModel;
