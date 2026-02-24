const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log(`[CONN] ${socket.id}`);

    socket.on('join', (room) => {
        socket.join(room);
        console.log(`[JOIN] ${socket.id} joined ${room}`);
    });

    socket.on('signal', (data) => {
        // Relays Offer, Answer, and ICE Candidates
        if (data.room) socket.to(data.room).emit('signal', data);
    });

    socket.on('command', (data) => {
        // Relays Clicks and Gestures
        if (data.room) socket.to(data.room).emit('command', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
