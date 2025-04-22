const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        default: 'not logged'
    },
    userQuestion: {
        type: String,
        required: true
    },
    botResponse: {
        type: String,
        required: true,
        default: ''
    },
    sessionId: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
