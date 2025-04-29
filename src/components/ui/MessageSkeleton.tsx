import React from 'react';
import Skeleton from './Skeleton';

interface MessageSkeletonProps {
  count?: number;
  className?: string;
}

export const MessageSkeleton: React.FC<MessageSkeletonProps> = ({
  count = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} items-end gap-2`}
        >
          {index % 2 === 0 && (
            <Skeleton 
              variant="circular" 
              width={32} 
              height={32} 
              className="flex-shrink-0"
            />
          )}
          
          <div className={`flex flex-col ${index % 2 === 0 ? 'items-start' : 'items-end'}`}>
            <Skeleton 
              variant="text"
              width={Math.floor(Math.random() * 150) + 60} 
              height={24}
              className="mb-2" 
            />
            <Skeleton 
              variant="text"
              width={Math.floor(Math.random() * 200) + 100}
              height={20} 
            />
          </div>
          
          {index % 2 !== 0 && (
            <Skeleton 
              variant="circular" 
              width={32} 
              height={32}
              className="flex-shrink-0" 
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton; 