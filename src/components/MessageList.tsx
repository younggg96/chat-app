import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { format, parseISO } from 'date-fns';
import { MessageBubble, MessageSkeleton } from './ui';

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function MessageList({ messages, isLoading = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUser = useChatStore((state) => state.currentUser);
  const [prevChatId, setPrevChatId] = useState<string | null>(null);
  const activeChat = useChatStore((state) => state.activeChat);
  const activeChatId = activeChat?.id || null;
  
  // 检测是否切换了聊天
  const [isSwitchingChat, setIsSwitchingChat] = useState(false);

  useEffect(() => {
    if (activeChatId !== prevChatId) {
      setPrevChatId(activeChatId);
    }
  }, [activeChatId, prevChatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSwitchingChat]);

  const formatTime = (date: Date | string) => {
    if (typeof date === 'string') {
      return format(parseISO(date), 'HH:mm');
    }
    return format(date, 'HH:mm');
  };
  
  if (isLoading || isSwitchingChat) {
    return (
      <div className="flex-1 p-5 overflow-y-auto">
        <MessageSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      <div className="mx-auto space-y-5">
        {messages.map((message) => {
          const isCurrentUser = message.sender === currentUser;
          
          return (
            <MessageBubble
              key={message.id}
              id={message.id}
              content={message.content}
              sender={message.sender}
              timestamp={formatTime(message.timestamp)}
              isCurrentUser={isCurrentUser}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
} 