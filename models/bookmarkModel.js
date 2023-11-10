const mongoose = require('mongoose')
const bookmarkSchema = new mongoose.Schema({
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
    
}, {timestamps: true})


const bookmarkModel = mongoose.model('bookmarkModel', bookmarkSchema);

module.exports = bookmarkModel