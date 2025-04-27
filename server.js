const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 用于存储所有连接的客户端
const clients = new Map();

wss.on('connection', (ws) => {
  console.log('客户端已连接');
  let userId = null;

  // 处理客户端消息
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('收到消息:', data);

    // 如果是登录消息，存储用户ID和对应的WebSocket连接
    if (data.type === 'login') {
      userId = data.userId;
      clients.set(userId, ws);
      console.log(`用户 ${userId} 已登录`);
      
      // 通知所有客户端有用户上线
      broadcastUserStatus(userId, true);
    } 
    // 如果是聊天消息，转发给目标用户
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
        // 如果目标用户不在线，存储离线消息（这里省略实现）
        console.log(`目标用户 ${data.to} 不在线，消息未发送`);
      }
    }
  });

  // 处理客户端断开连接
  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
      console.log(`用户 ${userId} 已断开连接`);
      
      // 通知所有客户端有用户下线
      broadcastUserStatus(userId, false);
    }
  });
});

// 广播用户状态变更
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
  console.log(`WebSocket 服务器已在端口 ${PORT} 上启动`);
}); 