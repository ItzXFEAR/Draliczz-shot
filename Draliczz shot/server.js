const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store player data
let players = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Add the player to the server's list
    players[socket.id] = { x: 0, y: 2, z: 0, yaw: 0, pitch: 0 };

    // Send all players' positions to the new player
    socket.emit('currentPlayers', players);

    // Broadcast new player to all others
    socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

    // Handle player movement updates
    socket.on('playerMove', (data) => {
        players[socket.id] = data;
        // Broadcast updated position to all players
        socket.broadcast.emit('playerMoved', { id: socket.id, ...data });
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        // Broadcast to other players that this player has left
        socket.broadcast.emit('playerLeft', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
