const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 启用JSON解析中间件
app.use(express.json());

// 存储连接的客户端
const clients = new Map();
// 存储聊天室
const chatRooms = new Map();
// 存储用户数据
const users = new Map();
// 存储离线消息
const offlineMessages = new Map();

// 初始化一些默认聊天室
chatRooms.set('general', {
  id: 'general',
  name: '公共聊天室',
  description: '所有人都可以加入的聊天室',
  members: [],
  messages: [],
  createdBy: 'system',
  createdAt: new Date(),
});

// AI机器人的配置
const AI_USER_ID = 'ai-assistant';
users.set(AI_USER_ID, {
  id: AI_USER_ID,
  username: 'AI助手',
  avatar: '🤖',
  isBot: true,
});

// 简单的AI回复生成函数
function generateAIResponse(message, userId, roomId) {
  const keywords = {
    'hello': '你好！有什么我能帮助你的吗？',
    'hi': '嗨！很高兴见到你。',
    '你好': '你好！今天有什么需要我帮助的吗？',
    '帮助': '我是AI助手，可以回答问题、提供信息或者陪你聊天。',
    '天气': '抱歉，我没有实时天气数据。你可以查看天气预报获取最新信息。',
    '谢谢': '不客气！随时为您服务。',
  };
  
  // 默认回复
  let response = '我是AI助手，很高兴为您服务。';
  
  // 检查关键词
  for (const [keyword, reply] of Object.entries(keywords)) {
    if (message.toLowerCase().includes(keyword)) {
      response = reply;
      break;
    }
  }
  
  // 构建AI消息
  return {
    id: uuidv4(),
    content: response,
    sender: AI_USER_ID,
    roomId: roomId,
    timestamp: new Date().toISOString(),
  };
}

// 广播消息到聊天室
function broadcastToRoom(roomId, message) {
  const room = chatRooms.get(roomId);
  if (!room) return;
  
  // 保存消息到聊天室历史
  room.messages.push(message);
  
  // 广播给所有在线的房间成员
  room.members.forEach(memberId => {
    const client = clients.get(memberId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    } else if (!clients.has(memberId)) {
      // 用户离线，保存为离线消息
      if (!offlineMessages.has(memberId)) {
        offlineMessages.set(memberId, []);
      }
      offlineMessages.get(memberId).push(message);
    }
  });
  
  // 如果消息不是来自AI，并且消息内容中包含@AI，触发AI回复
  if (message.sender !== AI_USER_ID && message.content.includes('@AI')) {
    setTimeout(() => {
      const aiResponse = generateAIResponse(message.content, message.sender, roomId);
      broadcastToRoom(roomId, aiResponse);
    }, 1000); // 1秒延迟，模拟思考
  }
}

// 更新用户状态并广播
function updateUserStatus(userId, isOnline) {
  const statusUpdate = {
    type: 'userStatus',
    userId: userId,
    online: isOnline,
    timestamp: new Date().toISOString()
  };
  
  // 广播给所有客户端
  for (const client of clients.values()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(statusUpdate));
    }
  }
}

// WebSocket连接处理
wss.on('connection', (ws) => {
  console.log('Client connected');
  let userId = null;
  
  // 处理客户端消息
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('Message received:', data);
    
    switch (data.type) {
      case 'login':
        // 用户登录处理
        userId = data.userId;
        clients.set(userId, ws);
        console.log(`User ${userId} logged in`);
        
        // 发送用户离线消息
        if (offlineMessages.has(userId)) {
          const messages = offlineMessages.get(userId);
          messages.forEach(msg => {
            ws.send(JSON.stringify(msg));
          });
          offlineMessages.delete(userId);
        }
        
        // 通知所有客户端用户上线
        updateUserStatus(userId, true);
        break;
        
      case 'private_message':
        // 单聊消息处理
        const targetWs = clients.get(data.to);
        const messageId = uuidv4();
        
        const privateMessage = {
          id: messageId,
          type: 'private_message',
          from: data.from,
          to: data.to,
          content: data.content,
          timestamp: new Date().toISOString()
        };
        
        // 发送给接收者
        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
          targetWs.send(JSON.stringify(privateMessage));
        } else {
          // 存储离线消息
          if (!offlineMessages.has(data.to)) {
            offlineMessages.set(data.to, []);
          }
          offlineMessages.get(data.to).push(privateMessage);
          console.log(`Target user ${data.to} is offline, message stored`);
        }
        
        // 回发确认给发送者
        ws.send(JSON.stringify({
          type: 'message_sent',
          messageId: messageId,
          timestamp: privateMessage.timestamp
        }));
        break;
        
      case 'join_room':
        // 加入聊天室
        const roomId = data.roomId;
        if (!chatRooms.has(roomId)) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Chat room does not exist',
            timestamp: new Date().toISOString()
          }));
          return;
        }
        
        const room = chatRooms.get(roomId);
        
        // 如果用户不在房间，添加用户
        if (!room.members.includes(userId)) {
          room.members.push(userId);
          
          // 发送通知
          const joinNotification = {
            type: 'system_notification',
            roomId: roomId,
            content: `${userId} 加入了聊天室`,
            timestamp: new Date().toISOString()
          };
          
          broadcastToRoom(roomId, joinNotification);
          
          // 向用户发送聊天室历史消息
          ws.send(JSON.stringify({
            type: 'room_history',
            roomId: roomId,
            messages: room.messages.slice(-50), // 只发送最近50条消息
            timestamp: new Date().toISOString()
          }));
        }
        break;
        
      case 'leave_room':
        // 离开聊天室
        const leaveRoomId = data.roomId;
        if (chatRooms.has(leaveRoomId)) {
          const leaveRoom = chatRooms.get(leaveRoomId);
          
          // 从成员列表中移除
          leaveRoom.members = leaveRoom.members.filter(id => id !== userId);
          
          // 发送通知
          const leaveNotification = {
            type: 'system_notification',
            roomId: leaveRoomId,
            content: `${userId} 离开了聊天室`,
            timestamp: new Date().toISOString()
          };
          
          broadcastToRoom(leaveRoomId, leaveNotification);
        }
        break;
        
      case 'room_message':
        // 群聊消息处理
        const targetRoomId = data.roomId;
        if (!chatRooms.has(targetRoomId)) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Chat room does not exist',
            timestamp: new Date().toISOString()
          }));
          return;
        }
        
        const targetRoom = chatRooms.get(targetRoomId);
        
        // 确保发送者是聊天室成员
        if (!targetRoom.members.includes(data.from)) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'You are not a member of this chat room',
            timestamp: new Date().toISOString()
          }));
          return;
        }
        
        // 构建消息并广播
        const roomMessage = {
          id: uuidv4(),
          type: 'room_message',
          roomId: targetRoomId,
          sender: data.from,
          content: data.content,
          timestamp: new Date().toISOString()
        };
        
        broadcastToRoom(targetRoomId, roomMessage);
        break;
        
      case 'create_room':
        // 创建新聊天室
        const newRoomId = uuidv4();
        chatRooms.set(newRoomId, {
          id: newRoomId,
          name: data.name,
          description: data.description || '',
          members: [userId],  // 创建者自动加入
          messages: [],
          createdBy: userId,
          createdAt: new Date()
        });
        
        // 通知创建者
        ws.send(JSON.stringify({
          type: 'room_created',
          room: {
            id: newRoomId,
            name: data.name,
            description: data.description || '',
            membersCount: 1,
            createdBy: userId,
            createdAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        }));
        
        // 广播新聊天室给所有用户
        const newRoomNotification = {
          type: 'new_room',
          room: {
            id: newRoomId,
            name: data.name,
            description: data.description || '',
            membersCount: 1,
            createdBy: userId,
            createdAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        };
        
        for (const client of clients.values()) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(newRoomNotification));
          }
        }
        break;
        
      case 'get_rooms':
        // 获取聊天室列表
        const roomsList = Array.from(chatRooms.values()).map(room => ({
          id: room.id,
          name: room.name,
          description: room.description,
          membersCount: room.members.length,
          createdBy: room.createdBy,
          createdAt: room.createdAt
        }));
        
        ws.send(JSON.stringify({
          type: 'rooms_list',
          rooms: roomsList,
          timestamp: new Date().toISOString()
        }));
        break;
    }
  });
  
  // 处理客户端断开连接
  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
      console.log(`User ${userId} disconnected`);
      
      // 更新用户在所有聊天室的状态
      updateUserStatus(userId, false);
    }
  });
});

// API 路由 - 用户注册
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // 基本验证
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // 检查用户名和邮箱是否已存在
  for (const user of users.values()) {
    if (user.email === email) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    if (user.username === username) {
      return res.status(400).json({ error: 'Username already taken' });
    }
  }
  
  // 创建新用户
  const userId = uuidv4();
  users.set(userId, {
    id: userId,
    username,
    email,
    password, // 实际应用中应该哈希处理
    avatar: username.charAt(0).toUpperCase(),
    createdAt: new Date()
  });
  
  res.status(201).json({
    id: userId,
    username,
    email,
    avatar: username.charAt(0).toUpperCase(),
    token: `token_${Math.random().toString(36).substr(2, 9)}`
  });
});

// API 路由 - 用户登录
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // 基本验证
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  
  // 查找用户
  let foundUser = null;
  for (const user of users.values()) {
    if (user.email === email) {
      foundUser = user;
      break;
    }
  }
  
  if (!foundUser) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // 验证密码
  if (foundUser.password !== password) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  res.status(200).json({
    id: foundUser.id,
    username: foundUser.username,
    email: foundUser.email,
    avatar: foundUser.avatar,
    token: `token_${Math.random().toString(36).substr(2, 9)}`
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
}); 