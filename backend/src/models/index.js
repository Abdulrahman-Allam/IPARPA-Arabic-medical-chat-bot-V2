const mongoose = require('mongoose');
const ChatMessage = require('./chatMessage');
const Appointment = require('./appointment');
const User = require('./user');
const Schedule = require('./schedule');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Item = mongoose.model('Item', itemSchema);

module.exports = {
    Item,
    ChatMessage,
    Appointment,
    User,
    Schedule
};