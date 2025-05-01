import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from "../store/chatStore";
import { MessageExtended } from './NotificationService';

// Handle image upload
export const handleImageUpload = (file: File, chatId: string, currentUser: string): Promise<MessageExtended> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target) {
        const imageData = e.target.result as string;
        // Send image message
        const message: MessageExtended = {
          id: uuidv4(),
          content: `![image](${imageData})`,
          contentType: 'image',
          sender: currentUser,
          timestamp: new Date().toISOString()
        };
        
        // Update message status
        const existingMessages = useChatStore.getState().messages[chatId] || [];
        useChatStore.getState().setMessages(chatId, [...existingMessages, message]);
        
        resolve(message);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}; 