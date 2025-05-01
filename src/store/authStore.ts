import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth methods
  register: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟用户数据存储
const mockUsers: Record<string, { id: string; username: string; email: string; password: string; avatar?: string }> = {
  "user1@example.com": {
    id: "user1",
    username: "Alice",
    email: "user1@example.com",
    password: "password123",
    avatar: "A"
  },
  "user2@example.com": {
    id: "user2",
    username: "Bob",
    email: "user2@example.com",
    password: "password123",
    avatar: "B"
  }
};

// 开发环境下启用模拟API
const USE_MOCK_API = true;

// 模拟API请求
async function mockFetch(url: string, options: RequestInit): Promise<Response> {
  // 模拟网络延迟
  await delay(500);
  
  // 解析请求体
  const body = options.body ? JSON.parse(options.body as string) : {};
  
  // 根据URL和方法模拟不同的API响应
  if (url === '/api/register' && options.method === 'POST') {
    const { username, email, password } = body;
    
    // 检查邮箱是否已存在
    if (mockUsers[email]) {
      return createMockResponse(400, { error: 'Email already registered' });
    }
    
    // 创建新用户
    const id = uuidv4();
    mockUsers[email] = { id, username, email, password, avatar: username.charAt(0).toUpperCase() };
    
    // 返回成功响应
    return createMockResponse(201, {
      id,
      username,
      email,
      avatar: username.charAt(0).toUpperCase(),
      token: `mock_token_${Math.random().toString(36).substr(2, 9)}`
    });
  }
  
  if (url === '/api/login' && options.method === 'POST') {
    const { email, password } = body;
    
    // 检查用户是否存在
    const user = mockUsers[email];
    if (!user) {
      return createMockResponse(404, { error: 'User not found' });
    }
    
    // 校验密码
    if (user.password !== password) {
      return createMockResponse(401, { error: 'Invalid password' });
    }
    
    // 返回成功响应
    return createMockResponse(200, {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token: `mock_token_${Math.random().toString(36).substr(2, 9)}`
    });
  }
  
  // 默认返回404错误
  return createMockResponse(404, { error: 'API endpoint not found' });
}

// 创建模拟响应
function createMockResponse(status: number, data: any): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 封装fetch函数，在开发环境下使用模拟API
async function fetchWithMock(url: string, options: RequestInit): Promise<Response> {
  if (USE_MOCK_API) {
    return mockFetch(url, options);
  }
  return fetch(url, options);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetchWithMock('/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
          });
          
          // 处理非2xx范围的响应
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
          }
          
          // 解析响应数据
          const userData = await response.json();
          
          // 登录用户
          set({
            user: { 
              id: userData.id, 
              username: userData.username, 
              email: userData.email, 
              avatar: userData.avatar 
            },
            token: userData.token,
            isAuthenticated: true,
            isLoading: false
          });
          
          console.log('User registered successfully:', userData);
        } catch (error: any) {
          console.error('Registration error:', error);
          set({ error: error.message, isLoading: false });
        }
      },
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetchWithMock('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
          });
          
          // 处理非2xx范围的响应
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
          }
          
          // 解析响应数据
          const userData = await response.json();
          
          // 登录用户
          set({
            user: { 
              id: userData.id, 
              username: userData.username, 
              email: userData.email, 
              avatar: userData.avatar 
            },
            token: userData.token,
            isAuthenticated: true,
            isLoading: false
          });
          
          console.log('User logged in successfully:', userData);
        } catch (error: any) {
          console.error('Login error:', error);
          set({ error: error.message, isLoading: false });
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },
      
      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          // 模拟延迟
          await delay(1000);
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error("Not logged in");
          }
          
          // 更新用户信息
          const updatedUser = { ...currentUser, ...userData };
          
          // 如果是模拟API，同时更新模拟用户
          if (USE_MOCK_API && currentUser.email && mockUsers[currentUser.email]) {
            mockUsers[currentUser.email] = {
              ...mockUsers[currentUser.email],
              ...userData,
              id: currentUser.id
            };
          }
          
          set({
            user: updatedUser,
            isLoading: false
          });
          
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated })
    }
  )
); 