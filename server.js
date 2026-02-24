const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Serve the web interface
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    socket.on('join', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    // The "Mailman" logic: Just relay messages to the other person in the room
    socket.on('signal', (data) => {
        // We broadcast to everyone in the room except the sender
        socket.to(data.room).emit('signal', data);
    });

    socket.on('command', (data) => {
        socket.to(data.room).emit('command', data);
    });

    socket.on('disconnect', () => console.log('Disconnected:', socket.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
