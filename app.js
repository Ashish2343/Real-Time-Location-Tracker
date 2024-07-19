const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('./model/Location.js');

dotenv.config({
    path: '.env'
});

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
};

connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));

io.on('connection', (socket) => {
    
    const ipAddress = socket.handshake.address;
    console.log(`User connected: ${socket.id}`);
    socket.on('send-location', async (data) => {
        const { usernameInput, latitude, longitude} = data; // Ensure usernameInput is correctly received
        try {
            // Find the existing location document by socket ID
            let existingLocation = await Location.findOne({ socketId: socket.id });

            if (existingLocation) {
                // Update existing document
                existingLocation.usernameInput = usernameInput;
                existingLocation.latitude = latitude;
                existingLocation.longitude = longitude;
                existingLocation.timestamp = new Date(); // Update timestamp if needed
                await existingLocation.save();
                console.log(`Location updated for ${usernameInput} ${socket.id}`);
            } else {
                const newLocation = new Location({
                    socketId: socket.id,
                    usernameInput,
                    latitude,
                    longitude,
                });
                await newLocation.save();
                console.log(`New location saved for ${usernameInput} ${socket.id}`);
            }
        } catch (error) {
            console.error('Error saving/updating location:', error);
        }
        io.emit('recieve-location', { id: socket.id, ...data });
    });

    socket.on('disconnect', () => {
        io.emit('user-disconnect', socket.id);
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

server.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`);
});
