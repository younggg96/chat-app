import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { format } from 'date-fns';
import { MessageBubble } from './ui';

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUser = useChatStore((state) => state.currentUser);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

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