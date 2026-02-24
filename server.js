const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a specific room (e.g., "device-1")
    socket.on('join', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Relay WebRTC signals (Offer, Answer, ICE Candidates)
    socket.on('signal', (data) => {
        // data contains { room, signal, type }
        socket.to(data.room).emit('signal', data);
    });

    // Relay Click commands from Browser to Phone
    socket.on('command', (data) => {
        socket.to(data.room).emit('command', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
