import { create } from "zustand";
import { persist } from "zustand/middleware";

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

// Simulate API call delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data storage
const users: Record<string, { id: string; username: string; email: string; password: string; avatar?: string }> = {
  "user1@example.com": {
    id: "1",
    username: "alice",
    email: "user1@example.com",
    password: "password123"
  },
  "user2@example.com": {
    id: "2",
    username: "bob",
    email: "user2@example.com",
    password: "password123"
  }
};

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
          await delay(1000); // Simulate network delay
          
          // Check if email is already registered
          if (users[email]) {
            throw new Error("Email already registered");
          }
          
          // Create new user
          const id = `${Object.keys(users).length + 1}`;
          const newUser = { id, username, email, password };
          users[email] = newUser;
          
          // Generate fake token
          const token = `token_${Math.random().toString(36).substr(2, 9)}`;
          
          // Login user
          set({
            user: { id, username, email },
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          await delay(1000); // Simulate network delay
          
          // Check if user exists
          const user = users[email];
          if (!user) {
            throw new Error("User does not exist");
          }
          
          // Validate password
          if (user.password !== password) {
            throw new Error("Incorrect password");
          }
          
          // Generate fake token
          const token = `token_${Math.random().toString(36).substr(2, 9)}`;
          
          // Login user
          set({
            user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
        } catch (error: any) {
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
          await delay(1000); // Simulate network delay
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error("Not logged in");
          }
          
          // Update user info
          const updatedUser = { ...currentUser, ...userData };
          
          // If email was updated, update users object
          if (userData.email && currentUser.email !== userData.email) {
            if (users[userData.email]) {
              throw new Error("Email already in use");
            }
            
            const userRecord = users[currentUser.email];
            if (userRecord) {
              delete users[currentUser.email];
              users[userData.email] = {
                ...userRecord,
                ...userData,
                email: userData.email
              };
            }
          } else if (currentUser.email) {
            // Update other fields
            users[currentUser.email] = {
              ...users[currentUser.email],
              ...userData
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