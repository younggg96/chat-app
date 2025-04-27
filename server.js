const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store all connected clients
const clients = new Map();

wss.on('connection', (ws) => {
  console.log('Client connected');
  let userId = null;

  // Handle client messages
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('Message received:', data);

    // If it's a login message, store the user ID and corresponding WebSocket connection
    if (data.type === 'login') {
      userId = data.userId;
      clients.set(userId, ws);
      console.log(`User ${userId} logged in`);
      
      // Notify all clients that a user is online
      broadcastUserStatus(userId, true);
    } 
    // If it's a chat message, forward it to the target user
    else if (data.type === 'message') {
      const targetWs = clients.get(data.to);
      if (targetWs && targetWs.readyState === WebSocket.OPEN) {
        targetWs.send(JSON.stringify({
          type: 'message',
          from: data.from,
          content: data.content,
          timestamp: new Date().toISOString()
        }));
      } else {
        // If the target user is not online, store offline messages (implementation omitted here)
        console.log(`Target user ${data.to} is offline, message not sent`);
      }
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
      console.log(`User ${userId} disconnected`);
      
      // Notify all clients that a user is offline
      broadcastUserStatus(userId, false);
    }
  });
});

// Broadcast user status changes
function broadcastUserStatus(userId, isOnline) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'userStatus',
        userId: userId,
        online: isOnline
      }));
    }
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server started on port ${PORT}`);
}); 