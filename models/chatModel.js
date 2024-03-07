const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "userModel",
    },
    userName: {
        type: String,
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: "eventModel",
    }, 
    message: [{
        userId: {
            type: String           
        },
        userName: {
            type: String,
        },
        user_image: {
            type: String,
            default: '',
        }, 
        text_message: {
            type: String,
        },
        sentTime: {
            type: String,
            default: function() {
                const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Calcutta' });
                return now;
            }
        }
    }],          
    message_count: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const chatModel = mongoose.model('chatModel', chatSchema);

module.exports = chatModel;
