const mongoose = require('mongoose')
const eventSchema = new mongoose.Schema({
    
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true

    },
    event_Type : {
        type : String,
        enum :['Business_Conference' , 'Music_Festivals' , 'Birthday' , 'Exhibitions', 'Wedding_Anniversary' , 'sports' , 'marriage'],
        required : true
    },
    co_hosts :[
        {
          co_host_Name: {
            type: String
          },
          phone_no : {
            type : Number 
          }
        },
      ],
      Guests :[
        {
          Guest_Name: {
            type: String
          },
          phone_no : {
            type : Number 
          },
          status :{
            type : Number,
            Enum :[0,1],
            default : 0
                             // 1 for save as favourate
          }
        },
      ],

      images:{
        type : [String],
        required : true,
      },

      venue_Date_and_time :[
        {
            venue_Name : {
                type : String,
                required : true,
            },
            venue_location : {
                type : String,
                required : true,
            },
            date : {
                type : Date,
                required : true,
            },
            start_time : {
                type : String,
                required : true,
            },
            end_time : {
                type : String,
                required : true
            },
        }
      ],
}, {timestamps: true})


const eventModel = mongoose.model('eventModel', eventSchema);

module.exports = eventModel