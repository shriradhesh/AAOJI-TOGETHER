const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  collections: [{
    name: {
      type: String,
      required: true,
    },
    entries: [{
      Guest_Name: {
        type: String,
      },
      phone_no: {
        type: String,
      },
      status: {
        type: Number,
        enum: [0, 1],
        default: 0,
        // 1 for save as favorite
      },
    }],
  }],
}, { timestamps: true });

const bookmarkModel = mongoose.model('bookmarkModel', bookmarkSchema);

module.exports = bookmarkModel;
