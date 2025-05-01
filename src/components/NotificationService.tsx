import { useChatStore } from "../store/chatStore";

// Extended message interface
export interface MessageExtended {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isLoading?: boolean;
  roomId?: string;
  isPrivate?: boolean;
  isSystemMessage?: boolean;
  status?: 'sending' | 'sent' | 'read';
  contentType?: 'text' | 'image';
}

// Create notification using browser Notification API
export function createNotification(chatId: string, message: MessageExtended, chatName: string) {
  // Check if browser supports notifications and permissions
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission === "granted") {
    showNotification(chatId, message, chatName);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        showNotification(chatId, message, chatName);
      }
    });
  }
}

// Show notification
function showNotification(chatId: string, message: MessageExtended, chatName: string) {
  let title = "";
  let body = message.content;
  
  // Determine sender name
  if (message.isSystemMessage) {
    title = "System Notification";
  } else {
    title = chatName || 'New message';
  }
  
  // Create notification
  const notification = new Notification(title, {
    body: body.length > 50 ? body.substring(0, 47) + "..." : body,
    icon: "/logo.png"
  });
  
  // Focus window when notification is clicked
  notification.onclick = () => {
    window.focus();
  };
}

// Initialize notification system
export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// Add status indicators to messages
export function addMessageStatusIndicators(currentUser: string | null) {
  if (!currentUser) return;
  
  // Add status to each message: sending, sent, read
  Object.entries(useChatStore.getState().messages).forEach(([chatId, msgs]) => {
    const setMessages = useChatStore.getState().setMessages;
    
    const updatedMsgs = msgs.map(msg => {
      const extendedMsg = msg as MessageExtended;
      if (extendedMsg.sender === currentUser && !extendedMsg.status) {
        return {...extendedMsg, status: 'sent'};
      }
      return extendedMsg;
    });
    
    setMessages(chatId, updatedMsgs);
  });
}

// Setup offline message queue
export function setupOfflineMessageQueue(chatService: any) {
  type QueuedMessage = {
    message: string;
    chatId: string;
    chatType: 'user' | 'room';
  };
  
  let offlineQueue: QueuedMessage[] = [];
  
  // Detect network status
  window.addEventListener('online', () => {
    // Reconnect
    const currentUser = useChatStore.getState().currentUser;
    if (currentUser) {
      chatService.connect(currentUser).then(() => {
        // Send queued messages
        while (offlineQueue.length > 0) {
          const queuedMessage = offlineQueue.shift();
          if (queuedMessage) {
            const { message, chatId, chatType } = queuedMessage;
            if (chatType === 'user') {
              chatService.sendPrivateMessage(chatId, message);
            } else {
              chatService.sendRoomMessage(chatId, message);
            }
          }
        }
      });
    }
  });
  
  // Handle offline state
  window.addEventListener('offline', () => {
    useChatStore.setState({ isConnected: false });
  });
} 