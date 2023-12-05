const mongoose = require('mongoose');

const UsersNotificationSchema = new mongoose.Schema({
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserModel'      
},  
eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'eventModel',     
},  

date: {
    type: Date,  
},

title :
{
  type : String
},

message :
{
  type : String
},

userEmail : {
    type : String
},
userName : {
    type : String
},
},{
  timestamps: true,
});

const UsersNotificationModel = mongoose.model('UsersNotificationModel', UsersNotificationSchema);

module.exports = UsersNotificationModel;