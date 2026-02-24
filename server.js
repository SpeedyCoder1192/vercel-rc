const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Serves your web controller from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    // Relay WebRTC signals (Offer, Answer, ICE Candidates)
    socket.on('signal', (data) => {
        // data looks like: { room: 'device-1', type: 'offer', signal: { sdp: '...' } }
        socket.to(data.room).emit('signal', data);
    });

    // Relay Remote Control commands (Clicks)
    socket.on('command', (data) => {
        console.log(`Command relayed: ${data.type} to ${data.room}`);
        socket.to(data.room).emit('command', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
