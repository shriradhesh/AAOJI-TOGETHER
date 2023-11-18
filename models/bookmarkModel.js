const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  Guest_Name: {
    type: String,
  },
  phone_no: {
    type: Number,
  },
  status: {
    type: Number,
    enum: [0, 1],
    default: 0,
    // 1 for save as favorite
  },
  collectionName : {
    type : String
  }
}, { timestamps: true });

const bookmarkModel = mongoose.model('bookmarkModel', bookmarkSchema);

module.exports = bookmarkModel;
