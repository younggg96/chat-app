import { useChatStore } from "../store/chatStore";

// Initialize chat sample data
export const initializeChatMockData = (currentUser: string | null) => {
  // Save existing user and chat room ID sets to avoid duplicates
  const existingUserIds = new Set(useChatStore.getState().users.map(u => u.id));
  const existingRoomIds = new Set(useChatStore.getState().rooms.map(r => r.id));
  
  // Mock users to add
  const mockUsers = [
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
  
  // Filter out existing users to ensure no duplicates
  const newUsers = mockUsers.filter(user => !existingUserIds.has(user.id));
  
  // Only update state if there are new users
  if (newUsers.length > 0) {
    console.log('Adding mock users:', newUsers.length);
    useChatStore.setState(state => ({
      users: [...state.users, ...newUsers]
    }));
  }
  
  // Mock chat rooms to add
  const mockRooms = [
    {
      id: 'room-1',
      name: 'General Discussion',
      description: 'General topics and announcements',
      membersCount: 4,
      createdBy: 'system',
      createdAt: new Date().toISOString()
    },
    {
      id: 'room-2',
      name: 'Tech Team',
      description: 'For technical discussions',
      membersCount: 3,
      createdBy: 'system',
      createdAt: new Date().toISOString()
    }
  ];
  
  // Filter out existing chat rooms to ensure no duplicates
  const newRooms = mockRooms.filter(room => !existingRoomIds.has(room.id));
  
  // Only update state if there are new chat rooms
  if (newRooms.length > 0) {
    console.log('Adding mock rooms:', newRooms.length);
    // Ensure createdBy is always a string
    const safeCurrentUser = currentUser || 'system';
    
    useChatStore.setState(state => ({
      rooms: [...state.rooms, ...newRooms.map(room => ({
        ...room,
        createdBy: safeCurrentUser
      }))]
    }));
  }
}; 