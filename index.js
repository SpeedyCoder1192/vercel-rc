const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

const SECRET_KEY = "66767";
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    if (req.headers['modheader'] !== SECRET_KEY) {
        res.writeHead(403);
        res.end("Access Denied");
        return;
    }
    if (req.url === "/" || req.url === "/index.html") {
        fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
});

const io = new Server(server, { cors: { origin: "*" } });

io.use((socket, next) => {
    if (socket.handshake.headers['modheader'] === SECRET_KEY) return next();
    next(new Error("Authentication error"));
});

io.on("connection", (socket) => {
    socket.on("register", (role) => socket.join(role));
    socket.on("signal", (data) => {
        const target = data.role === "phone" ? "controller" : "phone";
        socket.to(target).emit("signal", data.payload);
    });
    socket.on("command", (data) => socket.to("phone").emit("command", data));
});

server.listen(PORT, () => console.log(`Server running on ${PORT}`));
