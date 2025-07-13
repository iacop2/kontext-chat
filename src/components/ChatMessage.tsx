import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import { MessagePart } from './MessagePart';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: any[];
};

type ChatMessageProps = {
  message: Message;
};

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {message.role === 'user' ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="text-sm font-medium">
          {message.role === 'user' ? 'You' : 'AI Assistant'}
        </div>

        <div className="space-y-2">
          {message.parts.map((part, i) => (
            <MessagePart
              key={`${message.id}-${i}`}
              part={part}
              messageId={message.id}
              partIndex={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}