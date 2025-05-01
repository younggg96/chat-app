import { create } from "zustand";
import { persist } from "zustand/middleware";
import ollamaService, { OllamaMessage } from "../services/ollamaService";
import chatService, { Message as ChatMessage, ChatRoom, User } from "../services/chatService";
import { v4 as uuidv4 } from 'uuid';

// 本地消息类型
interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isLoading?: boolean;
  roomId?: string;
  isPrivate?: boolean;
  isSystemMessage?: boolean;
}

// AI助手ID常量
const AI_ASSISTANT_ID = 'ai-assistant';

// 聊天状态
interface ChatState {
  // 用户相关
  currentUser: string | null;
  activeChat: User | ChatRoom | null;
  activeType: 'user' | 'room' | null;
  users: User[];
  rooms: ChatRoom[];
  
  // 消息相关
  messages: Record<string, Message[]>; // userId/roomId -> messages
  isConnected: boolean;
  
  // AI 相关
  isUsingOllama: boolean;
  ollamaModel: string;
  ollamaConnected: boolean;
  ollamaIsGenerating: boolean;
  ollamaConversationIds: Record<string, string>; // 存储每个会话的对话ID
  
  // 方法
  login: (username: string, userId: string) => Promise<void>;
  logout: () => void;
  
  // 聊天目标选择
  selectChat: (id: string, type: 'user' | 'room') => void;
  
  // 消息发送与接收
  sendMessage: (content: string) => void;
  
  // 群聊功能
  createRoom: (name: string, description?: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  getRooms: () => void;
  
  // 连接状态
  setOllamaModel: (model: string) => void;
  testOllamaConnection: () => Promise<boolean>;
  clearChatHistory: (id?: string) => void;
  
  // 额外的状态管理
  setMessages: (chatId: string, messages: Message[]) => void;
  setOllamaIsGenerating: (isGenerating: boolean) => void;
}

// 创建聊天状态管理
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // 用户相关
      currentUser: null,
      activeChat: null,
      activeType: null,
      users: [],
      rooms: [],
      
      // 消息相关
      messages: {},
      isConnected: false,
      
      // AI 相关
      isUsingOllama: true,
      ollamaModel: 'llama2',
      ollamaConnected: false,
      ollamaIsGenerating: false,
      ollamaConversationIds: {},
      
      // 登录方法
      login: async (username, userId) => {
        set({ currentUser: userId });
        
        try {
          // 连接WebSocket
          await chatService.connect(userId);
          set({ isConnected: true });
          
          // 设置消息处理器
          chatService.onMessage((message: ChatMessage) => {
            const state = get();
            
            // 根据消息类型处理
            switch (message.type) {
              case 'private_message':
                // 处理私聊消息
                const chatId = message.sender === userId ? message.to! : message.sender;
                
                // 添加消息到对应的聊天
                set(state => {
                  const chatMessages = state.messages[chatId] || [];
                  return {
                    messages: {
                      ...state.messages,
                      [chatId]: [
                        ...chatMessages,
                        {
                          id: message.id,
                          content: message.content,
                          sender: message.sender,
                          timestamp: message.timestamp,
                          isPrivate: true
                        }
                      ]
                    }
                  };
                });
                break;
                
              case 'room_message':
                // 处理群聊消息
                if (!message.roomId) return;
                
                // 添加消息到对应的聊天室
                set(state => {
                  const roomMessages = state.messages[message.roomId!] || [];
                  return {
                    messages: {
                      ...state.messages,
                      [message.roomId!]: [
                        ...roomMessages,
                        {
                          id: message.id,
                          content: message.content,
                          sender: message.sender,
                          timestamp: message.timestamp,
                          roomId: message.roomId
                        }
                      ]
                    }
                  };
                });
                break;
                
              case 'system_notification':
                // 处理系统通知
                if (!message.roomId) return;
                
                // 添加系统消息到对应的聊天室
                set(state => {
                  const roomMessages = state.messages[message.roomId!] || [];
                  return {
                    messages: {
                      ...state.messages,
                      [message.roomId!]: [
                        ...roomMessages,
                        {
                          id: message.id,
                          content: message.content,
                          sender: 'system',
                          timestamp: message.timestamp,
                          roomId: message.roomId,
                          isSystemMessage: true
                        }
                      ]
                    }
                  };
                });
                break;
            }
          });
          
          // 处理用户状态变化
          chatService.onStatusChange((userId, isOnline) => {
            set(state => {
              // 更新用户列表
              const updatedUsers = state.users.map(user => 
                user.id === userId ? { ...user, online: isOnline } : user
              );
              
              return { users: updatedUsers };
            });
          });
          
          // 处理聊天室创建
          chatService.onRoomCreated((room: ChatRoom) => {
            set(state => {
              // 避免重复添加
              if (state.rooms.some(r => r.id === room.id)) {
                return {};
              }
              
              return { rooms: [...state.rooms, room] };
            });
          });
          
          // 处理聊天室列表
          chatService.onRoomsList((rooms: ChatRoom[]) => {
            set({ rooms });
          });
          
          // 获取聊天室列表
          chatService.getRooms();
          
          // 添加默认的AI助手到用户列表
          set(state => ({
            users: [
              ...state.users,
              {
                id: AI_ASSISTANT_ID,
                username: 'AI Assistant',
                avatar: '🤖',
                online: true
              }
            ]
          }));
          
          // 获取 Ollama 模型状态
          get().testOllamaConnection();
          
          // 登录成功后，初始化预设示例数据，仅在首次登录时
          setTimeout(() => {
            const currentState = get();
            if (currentState.currentUser && 
                (!currentState.users.some(u => u.id !== 'ai-assistant' && u.id !== currentState.currentUser) ||
                 currentState.rooms.length === 0)) {
              initializeMockData();
            }
          }, 500);
        } catch (error) {
          console.error('Failed to connect:', error);
          set({ isConnected: false });
        }
      },
      
      // 登出方法
      logout: () => {
        // 断开WebSocket连接
        chatService.disconnect();
        
        // 清空状态
        set({
          currentUser: null,
          activeChat: null,
          activeType: null,
          messages: {},
          users: [],
          rooms: [],
          isConnected: false
        });
      },
      
      // 选择聊天目标
      selectChat: (id, type) => {
        const state = get();
        
        if (type === 'user') {
          // 查找用户
          const user = state.users.find(u => u.id === id);
          if (user) {
            set({ activeChat: user, activeType: 'user' });
          }
        } else if (type === 'room') {
          // 查找聊天室
          const room = state.rooms.find(r => r.id === id);
          if (room) {
            set({ activeChat: room, activeType: 'room' });
            
            // 加入聊天室
            try {
              chatService.joinRoom(id);
            } catch (error) {
              console.error('Failed to join room:', error);
            }
          }
        }
      },
      
      // 发送消息
      sendMessage: (content) => {
        const state = get();
        const { currentUser, activeChat, activeType } = state;
        
        if (!currentUser || !activeChat) return;
        
        // 根据聊天类型发送消息
        if (activeType === 'user') {
          const targetId = (activeChat as User).id;
          
          // 处理AI助手消息
          if (targetId === AI_ASSISTANT_ID) {
            // 创建用户消息
            const userMessage: Message = {
              id: uuidv4(),
              content,
              sender: currentUser,
              timestamp: new Date().toISOString(),
              isPrivate: true
            };
            
            // 添加消息到聊天
            set(state => {
              const messages = state.messages[targetId] || [];
              return {
                messages: {
                  ...state.messages,
                  [targetId]: [...messages, userMessage]
                }
              };
            });
            
            // 创建AI回复中的占位消息
            const loadingMessage: Message = {
              id: uuidv4(),
              content: '',
              sender: targetId,
              timestamp: new Date().toISOString(),
              isLoading: true,
              isPrivate: true
            };
            
            // 添加占位消息
            set(state => {
              const messages = state.messages[targetId] || [];
              return {
                messages: {
                  ...state.messages,
                  [targetId]: [...messages, loadingMessage]
                },
                ollamaIsGenerating: true
              };
            });
            
            // 使用Ollama生成回复
            if (state.isUsingOllama && state.ollamaConnected) {
              // 获取或创建对话ID
              const conversationId = state.ollamaConversationIds[targetId] || '';
              
              // 如果没有会话ID，创建一个新的会话
              let actualConversationId = conversationId;
              if (!conversationId) {
                actualConversationId = ollamaService.createConversation('AI Chat', '你是一个有帮助的AI助手。');
                // 保存新的会话ID
                set(state => ({
                  ollamaConversationIds: {
                    ...state.ollamaConversationIds,
                    [targetId]: actualConversationId
                  }
                }));
              }
              
              // 发送请求到Ollama
              ollamaService.sendMessage(actualConversationId, content)
                .then(responseText => {
                  // 保存对话ID
                  set(state => ({
                    ollamaConversationIds: {
                      ...state.ollamaConversationIds,
                      [targetId]: actualConversationId
                    }
                  }));
                  
                  // 替换占位消息
                  set(state => {
                    const messages = state.messages[targetId] || [];
                    const messageIndex = messages.findIndex(m => m.id === loadingMessage.id);
                    
                    if (messageIndex !== -1) {
                      const newMessages = [...messages];
                      newMessages[messageIndex] = {
                        id: loadingMessage.id,
                        content: responseText,
                        sender: targetId,
                        timestamp: new Date().toISOString(),
                        isPrivate: true
                      };
                      
                      return {
                        messages: {
                          ...state.messages,
                          [targetId]: newMessages
                        },
                        ollamaIsGenerating: false
                      };
                    }
                    
                    return { ollamaIsGenerating: false };
                  });
                })
                .catch(error => {
                  console.error('Ollama error:', error);
                  
                  // 更新为错误消息
                  set(state => {
                    const messages = state.messages[targetId] || [];
                    const messageIndex = messages.findIndex(m => m.id === loadingMessage.id);
                    
                    if (messageIndex !== -1) {
                      const newMessages = [...messages];
                      newMessages[messageIndex] = {
                        id: loadingMessage.id,
                        content: `错误: ${error.message || '无法生成回复'}`,
                        sender: targetId,
                        timestamp: new Date().toISOString(),
                        isPrivate: true
                      };
                      
                      return {
                        messages: {
                          ...state.messages,
                          [targetId]: newMessages
                        },
                        ollamaIsGenerating: false
                      };
                    }
                    
                    return { ollamaIsGenerating: false };
                  });
                });
            } else {
              // 使用简单的模拟回复
              setTimeout(() => {
                set(state => {
                  const messages = state.messages[targetId] || [];
                  const messageIndex = messages.findIndex(m => m.id === loadingMessage.id);
                  
                  if (messageIndex !== -1) {
                    const newMessages = [...messages];
                    newMessages[messageIndex] = {
                      id: loadingMessage.id,
                      content: `你好！我是AI助手。你说: "${content}"`,
                      sender: targetId,
                      timestamp: new Date().toISOString(),
                      isPrivate: true
                    };
                    
                    return {
                      messages: {
                        ...state.messages,
                        [targetId]: newMessages
                      },
                      ollamaIsGenerating: false
                    };
                  }
                  
                  return { ollamaIsGenerating: false };
                });
              }, 1000);
            }
          } else {
            // 处理人类用户消息
            try {
              // 发送私聊消息
              const messageId = chatService.sendPrivateMessage(targetId, content);
              
              // 添加消息到本地
              const message: Message = {
                id: messageId,
                content,
                sender: currentUser,
                timestamp: new Date().toISOString(),
                isPrivate: true
              };
              
              set(state => {
                const messages = state.messages[targetId] || [];
                return {
                  messages: {
                    ...state.messages,
                    [targetId]: [...messages, message]
                  }
                };
              });
            } catch (error) {
              console.error('Failed to send message:', error);
            }
          }
        } else if (activeType === 'room') {
          // 处理群聊消息
          const roomId = (activeChat as ChatRoom).id;
          
          try {
            // 发送群聊消息
            const messageId = chatService.sendRoomMessage(roomId, content);
            
            // 添加消息到本地
            const message: Message = {
              id: messageId,
              content,
              sender: currentUser,
              timestamp: new Date().toISOString(),
              roomId
            };
            
            set(state => {
              const messages = state.messages[roomId] || [];
              return {
                messages: {
                  ...state.messages,
                  [roomId]: [...messages, message]
                }
              };
            });
          } catch (error) {
            console.error('Failed to send room message:', error);
          }
        }
      },
      
      // 创建聊天室
      createRoom: (name, description = '') => {
        try {
          chatService.createRoom(name, description);
        } catch (error) {
          console.error('Failed to create room:', error);
        }
      },
      
      // 加入聊天室
      joinRoom: (roomId) => {
        try {
          chatService.joinRoom(roomId);
        } catch (error) {
          console.error('Failed to join room:', error);
        }
      },
      
      // 离开聊天室
      leaveRoom: (roomId) => {
        try {
          chatService.leaveRoom(roomId);
          
          // 如果当前激活的是这个聊天室，清除激活状态
          const { activeChat, activeType } = get();
          if (activeType === 'room' && (activeChat as ChatRoom).id === roomId) {
            set({ activeChat: null, activeType: null });
          }
        } catch (error) {
          console.error('Failed to leave room:', error);
        }
      },
      
      // 获取聊天室列表
      getRooms: () => {
        try {
          chatService.getRooms();
        } catch (error) {
          console.error('Failed to get rooms:', error);
        }
      },
      
      // 设置Ollama模型
      setOllamaModel: (model) => {
        set({ ollamaModel: model });
      },
      
      // 测试Ollama连接
      testOllamaConnection: async () => {
        set({ ollamaConnected: false });
        
        if (!get().isUsingOllama) {
          return false;
        }
        
        try {
          const isConnected = await ollamaService.testConnection();
          set({ ollamaConnected: isConnected });
          return isConnected;
        } catch (error) {
          console.error('Failed to connect to Ollama:', error);
          set({ ollamaConnected: false });
          return false;
        }
      },
      
      // 清除聊天历史
      clearChatHistory: (id) => {
        const state = get();
        
        if (id) {
          // 清除指定聊天的历史
          set({
            messages: {
              ...state.messages,
              [id]: []
            }
          });
        } else if (state.activeChat) {
          // 清除当前活跃聊天的历史
          const chatId = state.activeType === 'user' 
            ? (state.activeChat as User).id 
            : (state.activeChat as ChatRoom).id;
          
          set({
            messages: {
              ...state.messages,
              [chatId]: []
            }
          });
        }
      },
      
      // 额外的状态管理
      setMessages: (chatId, messages) => {
        set(state => ({
          messages: {
            ...state.messages,
            [chatId]: messages
          }
        }));
      },
      setOllamaIsGenerating: (isGenerating) => {
        set({ ollamaIsGenerating: isGenerating });
      }
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        currentUser: state.currentUser,
        messages: state.messages,
        isUsingOllama: state.isUsingOllama,
        ollamaModel: state.ollamaModel,
        ollamaConversationIds: state.ollamaConversationIds
      })
    }
  )
);

// 初始化预设示例数据
const initializeMockData = () => {
  const state = useChatStore.getState();
  
  // 如果已经有数据，就不重新初始化
  if (state.users.length > 3 || state.rooms.length > 1) {
    return;
  }
  
  const currentUserId = state.currentUser;
  if (!currentUserId) return;
  
  // 1. 添加预设用户
  const mockUsers: User[] = [
    {
      id: 'ai-assistant',
      username: 'AI Assistant',
      online: true
    },
    {
      id: 'user-1',
      username: 'Sarah Parker',
      online: true
    },
    {
      id: 'user-2',
      username: 'Mike Johnson',
      online: false
    },
    {
      id: 'user-3',
      username: 'Alex Chen',
      online: true
    }
  ];
  
  // 只添加不存在的用户
  const existingUserIds = new Set(state.users.map(u => u.id));
  const newUsers = mockUsers.filter(u => !existingUserIds.has(u.id));
  
  if (newUsers.length > 0) {
    useChatStore.setState({
      users: [...state.users, ...newUsers]
    });
  }
  
  // 2. 添加预设聊天室
  const mockRooms: ChatRoom[] = [
    {
      id: 'room-1',
      name: 'General Discussion',
      description: 'General topics and announcements',
      membersCount: 4,
      createdBy: currentUserId,
      createdAt: new Date().toISOString()
    },
    {
      id: 'room-2',
      name: 'Tech Team',
      description: 'For technical discussions',
      membersCount: 3,
      createdBy: currentUserId,
      createdAt: new Date().toISOString()
    },
    {
      id: 'room-3',
      name: 'Random Fun',
      description: 'Share interesting stuff',
      membersCount: 4,
      createdBy: 'user-1',
      createdAt: new Date().toISOString()
    }
  ];
  
  // 只添加不存在的聊天室
  const existingRoomIds = new Set(state.rooms.map(r => r.id));
  const newRooms = mockRooms.filter(r => !existingRoomIds.has(r.id));
  
  if (newRooms.length > 0) {
    useChatStore.setState({
      rooms: [...state.rooms, ...newRooms]
    });
  }
  
  // 3. 添加一些示例消息
  const newMessages: Record<string, Message[]> = { ...state.messages };
  
  // AI 对话
  if (!newMessages['ai-assistant'] || newMessages['ai-assistant'].length === 0) {
    newMessages['ai-assistant'] = [
      {
        id: 'msg-ai-1',
        content: `Hello! How can I assist you today?`,
        sender: 'ai-assistant',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'msg-ai-2',
        content: `I need help with building a chat application.`,
        sender: currentUserId,
        timestamp: new Date(Date.now() - 3500000).toISOString()
      },
      {
        id: 'msg-ai-3',
        content: `I'd be happy to help! Building a chat application involves several components: a frontend UI, a backend service for message handling, and often a database to store message history. What specific aspect are you looking to implement first?`,
        sender: 'ai-assistant',
        timestamp: new Date(Date.now() - 3400000).toISOString()
      }
    ];
  }
  
  // 与 Sarah 的对话
  if (!newMessages['user-1'] || newMessages['user-1'].length === 0) {
    newMessages['user-1'] = [
      {
        id: 'msg-sarah-1',
        content: `Hey, how's the project going?`,
        sender: 'user-1',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        isPrivate: true
      },
      {
        id: 'msg-sarah-2',
        content: `Making good progress! I've completed the UI design.`,
        sender: currentUserId,
        timestamp: new Date(Date.now() - 85400000).toISOString(),
        isPrivate: true
      },
      {
        id: 'msg-sarah-3',
        content: `Great! Let's review it in our next meeting.`,
        sender: 'user-1',
        timestamp: new Date(Date.now() - 84400000).toISOString(),
        isPrivate: true
      }
    ];
  }
  
  // 聊天室1的消息
  if (!newMessages['room-1'] || newMessages['room-1'].length === 0) {
    newMessages['room-1'] = [
      {
        id: 'msg-room1-1',
        content: `Welcome to the General Discussion room!`,
        sender: 'system',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        roomId: 'room-1',
        isSystemMessage: true
      },
      {
        id: 'msg-room1-2',
        content: `Hello everyone! Excited to collaborate here.`,
        sender: currentUserId,
        timestamp: new Date(Date.now() - 172700000).toISOString(),
        roomId: 'room-1'
      },
      {
        id: 'msg-room1-3',
        content: `@${state.users.find(u => u.id === currentUserId)?.username || 'You'} Welcome aboard! Let's make something great together.`,
        sender: 'user-1',
        timestamp: new Date(Date.now() - 172600000).toISOString(),
        roomId: 'room-1'
      },
      {
        id: 'msg-room1-4',
        content: `Has anyone started looking at the new requirements?`,
        sender: 'user-3',
        timestamp: new Date(Date.now() - 86300000).toISOString(),
        roomId: 'room-1'
      },
      {
        id: 'msg-room1-5',
        content: `@AI Can you summarize the project requirements for us?`,
        sender: 'user-1',
        timestamp: new Date(Date.now() - 86200000).toISOString(),
        roomId: 'room-1'
      },
      {
        id: 'msg-room1-6',
        content: `Based on the information provided, the project requires building a real-time chat application with user authentication, message history, and AI assistance features. The UI should be responsive and user-friendly. Would you like me to elaborate on any specific aspect?`,
        sender: 'ai-assistant',
        timestamp: new Date(Date.now() - 86100000).toISOString(),
        roomId: 'room-1'
      }
    ];
  }
  
  // 聊天室2的消息
  if (!newMessages['room-2'] || newMessages['room-2'].length === 0) {
    newMessages['room-2'] = [
      {
        id: 'msg-room2-1',
        content: `Tech Team room created`,
        sender: 'system',
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        roomId: 'room-2',
        isSystemMessage: true
      },
      {
        id: 'msg-room2-2',
        content: `Let's discuss the tech stack for our new project.`,
        sender: currentUserId,
        timestamp: new Date(Date.now() - 259100000).toISOString(),
        roomId: 'room-2'
      },
      {
        id: 'msg-room2-3',
        content: `I suggest we use React for the frontend and Node.js for the backend.`,
        sender: 'user-3',
        timestamp: new Date(Date.now() - 259000000).toISOString(),
        roomId: 'room-2'
      },
      {
        id: 'msg-room2-4',
        content: `What about using WebSockets for real-time communication?`,
        sender: 'user-2',
        timestamp: new Date(Date.now() - 258900000).toISOString(),
        roomId: 'room-2'
      },
      {
        id: 'msg-room2-5',
        content: `Great idea! That will make the chat experience much smoother.`,
        sender: currentUserId,
        timestamp: new Date(Date.now() - 258800000).toISOString(),
        roomId: 'room-2'
      }
    ];
  }
  
  useChatStore.setState({ messages: newMessages });
};

export default useChatStore;