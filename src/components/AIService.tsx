import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from "../store/chatStore";
import { MessageExtended } from './NotificationService';

// Handle AI response generation
export const generateAIResponse = (content: string, roomId: string) => {
  const users = useChatStore.getState().users;
  const setMessages = useChatStore.getState().setMessages;
  const setOllamaIsGenerating = useChatStore.getState().setOllamaIsGenerating;

  const aiAssistant = users.find(u => u.id === 'ai-assistant');
  
  if (aiAssistant) {
    // Create placeholder message for AI response
    const loadingMessage: MessageExtended = {
      id: uuidv4(),
      content: '',
      sender: aiAssistant.id,
      timestamp: new Date().toISOString(),
      isLoading: true,
      roomId: roomId
    };
    
    // Add placeholder message
    const roomMessages = useChatStore.getState().messages[roomId] || [];
    setMessages(roomId, [...roomMessages, loadingMessage]);
    setOllamaIsGenerating(true);
    
    // Simulate AI response - this would be replaced with actual AI API call
    setTimeout(() => {
      const updatedMessages = useChatStore.getState().messages[roomId] || [];
      const messageIndex = updatedMessages.findIndex(m => m.id === loadingMessage.id);
      
      if (messageIndex !== -1) {
        const newMessages = [...updatedMessages];
        newMessages[messageIndex] = {
          id: loadingMessage.id,
          content: `I'm responding to your question: "${content}"`,
          sender: aiAssistant.id,
          timestamp: new Date().toISOString(),
          roomId: roomId
        };
        
        setMessages(roomId, newMessages);
      }
      
      setOllamaIsGenerating(false);
    }, 1500);
  }
};

// Enhanced mention detection, returns whether @AI was mentioned
export const detectAIMention = (content: string, roomId: string): boolean => {
  // Detect @AI format
  if (content.includes('@AI ') || content.includes('@AI Assistant')) {
    // Trigger AI response
    const aiContent = content.replace(/@AI\s+|@AI Assistant\s+/g, '');
    generateAIResponse(aiContent, roomId);
    return true;
  }
  return false;
}; 