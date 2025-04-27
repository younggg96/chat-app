import { create } from "zustand";

// 消息类型定义
interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: Date;
}

// 用户类型定义
interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

// 其他用户
const otherUsers: User[] = [
  {
    id: "user1",
    name: "Alice",
    avatar: "A",
    online: true
  },
  {
    id: "user2",
    name: "Bob",
    avatar: "B",
    online: true
  },
  {
    id: "user3",
    name: "Charlie",
    avatar: "C",
    online: false
  }
];

// 状态类型定义
interface ChatState {
  currentUser: string | null;
  activeChat: User | null;
  users: User[];
  messages: Record<string, Message[]>;
  socket: WebSocket | null;
  login: (username: string) => void;
  logout: () => void;
  selectChat: (userId: string) => void;
  sendMessage: (content: string) => void;
  receiveMessage: (userId: string, content: string) => void;
  updateUserStatus: (userId: string, online: boolean) => void;
}

// WebSocket连接类
class WebSocketConnection {
  private static instance: WebSocketConnection | null = null;
  private socket: WebSocket | null = null;
  private callbacks: Record<string, Function[]> = {};
  
  private constructor() {}
  
  public static getInstance(): WebSocketConnection {
    if (!WebSocketConnection.instance) {
      WebSocketConnection.instance = new WebSocketConnection();
    }
    return WebSocketConnection.instance;
  }
  
  public connect(): WebSocket {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return this.socket;
    }
    
    const wsUrl = 'ws://localhost:3001';
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('WebSocket连接已打开');
      this.emit('open');
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      } catch (error) {
        console.error('解析消息时出错:', error);
      }
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket连接已关闭');
      this.socket = null;
      this.emit('close');
      
      // 尝试重新连接
      setTimeout(() => this.connect(), 5000);
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket错误:', error);
      this.emit('error', error);
    };
    
    return this.socket;
  }
  
  public on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }
  
  public emit(event: string, ...args: any[]) {
    const callbacks = this.callbacks[event] || [];
    callbacks.forEach(callback => callback(...args));
  }
  
  public send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('尝试在关闭的连接上发送消息');
      this.connect();
    }
  }
  
  public close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// 获取WebSocket连接实例
const wsConnection = WebSocketConnection.getInstance();

export const useChatStore = create<ChatState>((set, get) => {
  // 设置WebSocket监听器
  wsConnection.on('message', (data: any) => {
    const state = get();
    
    if (state.activeChat && state.activeChat.id === data.from) {
      // 收到当前聊天对象的消息
      set(state => {
        const userMessages = state.messages[data.from] || [];
        return {
          messages: {
            ...state.messages,
            [data.from]: [
              ...userMessages,
              {
                id: Date.now(),
                content: data.content,
                sender: data.from,
                timestamp: new Date(data.timestamp)
              }
            ]
          }
        };
      });
    } else {
      // 收到其他用户的消息，可以显示通知
      console.log(`收到来自 ${data.from} 的新消息`);
    }
  });
  
  wsConnection.on('userStatus', (data: any) => {
    // 更新用户在线状态
    set(state => ({
      users: state.users.map(user => 
        user.id === data.userId ? { ...user, online: data.online } : user
      )
    }));
  });
  
  return {
    currentUser: null,
    activeChat: null,
    users: otherUsers,
    messages: {},
    socket: null,
    
    login: (username) => {
      // 连接WebSocket
      const socket = wsConnection.connect();
      
      // 发送登录消息
      wsConnection.send({
        type: 'login',
        userId: username
      });
      
      set({ currentUser: username, socket });
    },
    
    logout: () => {
      // 关闭WebSocket连接
      wsConnection.close();
      
      set({ 
        currentUser: null, 
        activeChat: null,
        messages: {},
        socket: null
      });
    },
    
    selectChat: (userId) => {
      const user = otherUsers.find(u => u.id === userId);
      if (user) {
        set({ activeChat: user });
      }
    },
    
    sendMessage: (content) => {
      const state = get();
      if (!state.activeChat || !state.currentUser) return;
      
      const userId = state.activeChat.id;
      const messageId = Date.now();
      
      // 更新本地消息状态
      set(state => {
        const userMessages = state.messages[userId] || [];
        const newMessages = {
          ...state.messages,
          [userId]: [
            ...userMessages,
            {
              id: messageId,
              content,
              sender: state.currentUser || "Me",
              timestamp: new Date()
            }
          ]
        };
        
        return { messages: newMessages };
      });
      
      // 通过WebSocket发送消息
      wsConnection.send({
        type: 'message',
        from: state.currentUser,
        to: userId,
        content: content,
        messageId
      });
    },
    
    receiveMessage: (userId, content) => {
      set(state => {
        const userMessages = state.messages[userId] || [];
        return {
          messages: {
            ...state.messages,
            [userId]: [
              ...userMessages,
              {
                id: Date.now(),
                content,
                sender: userId,
                timestamp: new Date()
              }
            ]
          }
        };
      });
    },
    
    updateUserStatus: (userId, online) => {
      set(state => ({
        users: state.users.map(user => 
          user.id === userId ? { ...user, online } : user
        )
      }));
    }
  };
});