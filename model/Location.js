const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    socketId : String,
    usernameInput: String,
    latitude: String,
    longitude: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
