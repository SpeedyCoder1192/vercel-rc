const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with permissive CORS for Android and Web clients
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serves the web dashboard from a folder named 'public'
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log(`[CONN] User connected: ${socket.id}`);

    // Devices and Browsers join the same room (e.g., 'device-1')
    socket.on('join', (room) => {
        socket.join(room);
        console.log(`[ROOM] User ${socket.id} joined: ${room}`);
    });

    // RELAY: This passes WebRTC Offers, Answers, and ICE Candidates
    socket.on('signal', (data) => {
        if (!data.room) return;
        
        // Log the signal type to debug the handshake flow
        console.log(`[SIGNAL] Relaying ${data.type} to room ${data.room}`);
        
        // Broadcast to everyone else in the room
        socket.to(data.room).emit('signal', data);
    });

    // RELAY: This passes click/gesture commands
    socket.on('command', (data) => {
        if (!data.room) return;
        
        console.log(`[CMD] Relaying ${data.type} (x:${data.x}, y:${data.y})`);
        socket.to(data.room).emit('command', data);
    });

    socket.on('disconnect', () => {
        console.log(`[DISCONN] User disconnected: ${socket.id}`);
    });
});

// Render provides the PORT environment variable automatically
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> Server is live on port ${PORT}`);
    console.log(`>>> Web dashboard: https://rc-hecl.onrender.com`);
});
