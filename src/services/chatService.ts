import { v4 as uuidv4 } from 'uuid';

// 消息类型
export interface Message {
  id: string;
  type: 'private_message' | 'room_message' | 'system_notification';
  content: string;
  sender: string;
  timestamp: string;
  roomId?: string;
  to?: string;
}

// 聊天室类型
export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  createdBy: string;
  createdAt: string;
}

// 用户类型
export interface User {
  id: string;
  username: string;
  avatar?: string;
  online: boolean;
}

// WebSocket消息回调类型
type MessageCallback = (message: Message) => void;
type StatusCallback = (userId: string, isOnline: boolean) => void;
type RoomCallback = (room: ChatRoom) => void;
type RoomsListCallback = (rooms: ChatRoom[]) => void;
type ErrorCallback = (error: string) => void;
type ConnectCallback = () => void;
type DisconnectCallback = () => void;

class ChatService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private messageCallbacks: MessageCallback[] = [];
  private statusCallbacks: StatusCallback[] = [];
  private roomCallbacks: RoomCallback[] = [];
  private roomsListCallbacks: RoomsListCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private connectCallbacks: ConnectCallback[] = [];
  private disconnectCallbacks: DisconnectCallback[] = [];
  private userId: string | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  
  // 连接WebSocket服务器
  connect(userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.isConnected) {
        this.disconnect();
      }
      
      this.userId = userId;
      const url = 'ws://localhost:3001';
      
      try {
        this.socket = new WebSocket(url);
        
        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // 发送登录消息
          this.login();
          
          // 通知回调
          this.connectCallbacks.forEach(callback => callback());
          resolve(true);
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
        
        this.socket.onclose = () => {
          console.log('WebSocket connection closed');
          this.isConnected = false;
          
          // 通知回调
          this.disconnectCallbacks.forEach(callback => callback());
          
          // 尝试重连
          this.tryReconnect();
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.errorCallbacks.forEach(callback => callback(error.toString()));
          reject(error);
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        reject(error);
      }
    });
  }
  
  // 尝试重连
  private tryReconnect() {
    if (this.reconnectTimer || this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.userId) {
        this.connect(this.userId).catch(() => {
          // 连接失败，将在下一次尝试重连
        });
      }
    }, 5000); // 5秒后尝试重连
  }
  
  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.userId = null;
  }
  
  // 发送登录消息
  private login() {
    if (!this.isConnected || !this.userId) return;
    
    this.send({
      type: 'login',
      userId: this.userId
    });
  }
  
  // 发送私聊消息
  sendPrivateMessage(to: string, content: string): string {
    if (!this.isConnected || !this.userId) {
      throw new Error('Not connected');
    }
    
    const messageId = uuidv4();
    
    this.send({
      type: 'private_message',
      from: this.userId,
      to,
      content,
      id: messageId
    });
    
    return messageId;
  }
  
  // 发送群聊消息
  sendRoomMessage(roomId: string, content: string): string {
    if (!this.isConnected || !this.userId) {
      throw new Error('Not connected');
    }
    
    const messageId = uuidv4();
    
    this.send({
      type: 'room_message',
      from: this.userId,
      roomId,
      content,
      id: messageId
    });
    
    return messageId;
  }
  
  // 加入聊天室
  joinRoom(roomId: string) {
    if (!this.isConnected || !this.userId) {
      throw new Error('Not connected');
    }
    
    this.send({
      type: 'join_room',
      roomId,
      userId: this.userId
    });
  }
  
  // 离开聊天室
  leaveRoom(roomId: string) {
    if (!this.isConnected || !this.userId) {
      throw new Error('Not connected');
    }
    
    this.send({
      type: 'leave_room',
      roomId,
      userId: this.userId
    });
  }
  
  // 创建聊天室
  createRoom(name: string, description: string = '') {
    if (!this.isConnected || !this.userId) {
      throw new Error('Not connected');
    }
    
    this.send({
      type: 'create_room',
      name,
      description,
      userId: this.userId
    });
  }
  
  // 获取聊天室列表
  getRooms() {
    if (!this.isConnected) {
      throw new Error('Not connected');
    }
    
    this.send({
      type: 'get_rooms'
    });
  }
  
  // 发送消息
  private send(data: any) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to WebSocket server');
    }
    
    this.socket.send(JSON.stringify(data));
  }
  
  // 处理收到的消息
  private handleMessage(data: any) {
    console.log('Received message:', data);
    
    switch (data.type) {
      case 'private_message':
      case 'room_message':
      case 'system_notification':
        // 处理各类消息
        this.messageCallbacks.forEach(callback => callback(data));
        break;
        
      case 'userStatus':
        // 处理用户状态更新
        this.statusCallbacks.forEach(callback => callback(data.userId, data.online));
        break;
        
      case 'room_created':
      case 'new_room':
        // 处理聊天室创建
        this.roomCallbacks.forEach(callback => callback(data.room));
        break;
        
      case 'rooms_list':
        // 处理聊天室列表
        this.roomsListCallbacks.forEach(callback => callback(data.rooms));
        break;
        
      case 'error':
        // 处理错误消息
        this.errorCallbacks.forEach(callback => callback(data.message));
        break;
    }
  }
  
  // 注册消息回调
  onMessage(callback: MessageCallback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // 注册状态回调
  onStatusChange(callback: StatusCallback) {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // 注册聊天室回调
  onRoomCreated(callback: RoomCallback) {
    this.roomCallbacks.push(callback);
    return () => {
      this.roomCallbacks = this.roomCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // 注册聊天室列表回调
  onRoomsList(callback: RoomsListCallback) {
    this.roomsListCallbacks.push(callback);
    return () => {
      this.roomsListCallbacks = this.roomsListCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // 注册错误回调
  onError(callback: ErrorCallback) {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // 注册连接回调
  onConnect(callback: ConnectCallback) {
    this.connectCallbacks.push(callback);
    return () => {
      this.connectCallbacks = this.connectCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // 注册断开连接回调
  onDisconnect(callback: DisconnectCallback) {
    this.disconnectCallbacks.push(callback);
    return () => {
      this.disconnectCallbacks = this.disconnectCallbacks.filter(cb => cb !== callback);
    };
  }
}

// 导出单例
export const chatService = new ChatService();
export default chatService; 