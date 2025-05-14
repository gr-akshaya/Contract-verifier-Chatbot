import React from 'react';
import { Message } from '../../types';
import { Code, Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';

  return (
    <div
      className={`flex w-full mb-4 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex items-start max-w-[80%] ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div
          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-primary-500 ml-2' : 'bg-gray-700 mr-2'
          }`}
        >
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-white" />
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${
            isUser
              ? 'bg-primary-500 text-white rounded-tr-none'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
          }`}
        >
          {typeof message.content === 'string' ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            message.content
          )}
          <div
            className={`text-xs mt-1 ${
              isUser ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;