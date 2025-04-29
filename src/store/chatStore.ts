import { create } from "zustand";
import { persist } from "zustand/middleware";

// Message type definition
interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: Date;
}

// User type definition
interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

// Other users
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

// Chat state interface
interface ChatState {
  currentUser: string | null;
  activeChat: User | null;
  users: User[];
  messages: Record<string, Message[]>;
  socket: WebSocket | null;
  isOfflineMode: boolean;
  login: (username: string) => void;
  logout: () => void;
  selectChat: (userId: string) => void;
  sendMessage: (content: string) => void;
  receiveMessage: (userId: string, content: string) => void;
  updateUserStatus: (userId: string, online: boolean) => void;
  setOfflineMode: (enabled: boolean) => void;
}

// WebSocket connection class
class WebSocketConnection {
  private static instance: WebSocketConnection | null = null;
  private socket: WebSocket | null = null;
  private callbacks: Record<string, Function[]> = {};
  private isOfflineMode: boolean = false;
  
  private constructor() {}
  
  public static getInstance(): WebSocketConnection {
    if (!WebSocketConnection.instance) {
      WebSocketConnection.instance = new WebSocketConnection();
    }
    return WebSocketConnection.instance;
  }
  
  public on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }
  
  public off(event: string, callback: Function) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }
  
  private emit(event: string, data?: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  public setOfflineMode(enabled: boolean) {
    this.isOfflineMode = enabled;
    console.log(`WebSocket ${enabled ? 'offline' : 'online'} mode enabled`);
    
    // If offline mode is enabled, close existing connection
    if (enabled && this.socket) {
      this.close();
    }
  }
  
  public connect(): WebSocket | null {
    if (this.isOfflineMode) {
      console.log('In offline mode, not establishing WebSocket connection');
      return null;
    }
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return this.socket;
    }
    
    try {
      const wsUrl = 'ws://localhost:3001';
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection opened');
        this.emit('open');
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.socket = null;
        this.emit('close');
        
        // After connection failure, automatically enable offline mode
        if (!this.isOfflineMode) {
          console.log('WebSocket connection failed, automatically switching to offline mode');
          this.isOfflineMode = true;
          this.emit('offline');
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
      
      return this.socket;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isOfflineMode = true;
      this.emit('offline');
      return null;
    }
  }
  
  public close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  public send(data: any) {
    if (this.isOfflineMode) {
      // Simulate message sending in offline mode
      console.log('Offline mode, simulating message send:', data);
      
      // If it's a message type request, simulate a reply
      if (data.type === 'message') {
        setTimeout(() => {
          this.emit('message', {
            type: 'message',
            from: data.to,
            to: data.from,
            content: `Echo: ${data.content}`,
            timestamp: new Date().toISOString()
          });
        }, 500);
      }
      
      return;
    }
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('Attempting to send message on closed connection');
      this.connect();
    }
  }
}

// Get WebSocket connection instance
const wsConnection = WebSocketConnection.getInstance();
// Set to offline mode to avoid infinite connection attempts
wsConnection.setOfflineMode(true);

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => {
      // Set up WebSocket listeners
      wsConnection.on('message', (data: any) => {
        const state = get();
        if (!state.currentUser) return;
        
        const senderId = data.from;
        const receiverId = data.to;
        
        if (receiverId === state.currentUser) {
          const message: Message = {
            id: Date.now(),
            content: data.content,
            sender: senderId,
            timestamp: new Date()
          };
          
          set(state => ({
            messages: {
              ...state.messages,
              [senderId]: [...(state.messages[senderId] || []), message]
            }
          }));
        }
      });
      
      wsConnection.on('userStatus', (data: any) => {
        // Update user online status
        set(state => ({
          users: state.users.map(user => 
            user.id === data.userId ? { ...user, online: data.online } : user
          )
        }));
      });
      
      // Offline mode handling
      wsConnection.on('offline', () => {
        set({ isOfflineMode: true });
      });
      
      return {
        currentUser: null,
        activeChat: null,
        users: otherUsers,
        messages: {},
        socket: null,
        isOfflineMode: true,
        
        setOfflineMode: (enabled) => {
          wsConnection.setOfflineMode(enabled);
          set({ isOfflineMode: enabled });
        },
        
        login: (username) => {
          // Try to connect WebSocket
          const socket = wsConnection.connect();
          
          // Send login message
          wsConnection.send({
            type: 'login',
            userId: username
          });
          
          set({ currentUser: username, socket });
        },
        
        logout: () => {
          // Close WebSocket connection
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
            
            // In offline mode, pre-populate some messages
            const state = get();
            if (state.isOfflineMode && state.currentUser && 
                (!state.messages[userId] || state.messages[userId].length === 0)) {
              const welcomeMessages = [
                {
                  id: Date.now() - 3000,
                  content: `Hello, ${state.currentUser}! This is a demo message in offline mode.`,
                  sender: userId,
                  timestamp: new Date(Date.now() - 3000)
                },
                {
                  id: Date.now() - 2000,
                  content: "You can test the messaging feature here.",
                  sender: userId,
                  timestamp: new Date(Date.now() - 2000)
                }
              ];
              
              set(state => ({
                messages: {
                  ...state.messages,
                  [userId]: welcomeMessages
                }
              }));
            }
          }
        },
        
        sendMessage: (content) => {
          const state = get();
          if (!state.currentUser || !state.activeChat) return;
          
          const message: Message = {
            id: Date.now(),
            content,
            sender: state.currentUser,
            timestamp: new Date()
          };
          
          // Add message to local state
          set(state => ({
            messages: {
              ...state.messages,
              [state.activeChat!.id]: [...(state.messages[state.activeChat!.id] || []), message]
            }
          }));
          
          // Send via WebSocket
          wsConnection.send({
            type: 'message',
            from: state.currentUser,
            to: state.activeChat.id,
            content
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
    },
    {
      name: 'chat-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        messages: state.messages
      }),
    }
  )
);