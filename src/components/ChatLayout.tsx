import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatMessage } from '@/components/ChatMessage';
import { ExampleCards } from '@/components/ExampleCards';

interface ChatLayoutProps {
  messages: any[];
  error: any;
  rateLimitInfo?: any;
  onExampleSelect: (prompt: string, imageUrl?: string, styleId?: string) => void;
  onUseImageAsInput: (imageUrl: string) => void;
  onRetry: () => void;
  children: React.ReactNode;
}

export function ChatLayout({
  messages,
  error,
  rateLimitInfo,
  onExampleSelect,
  onUseImageAsInput,
  onRetry,
  children
}: ChatLayoutProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader />

      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <ExampleCards onExampleSelect={onExampleSelect} />
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto space-y-4 p-4">
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} onUseAsInput={onUseImageAsInput} />
              ))}

              {/* Rate Limit Display */}
              {rateLimitInfo && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.345 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-yellow-800">Rate limit reached</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        {rateLimitInfo.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && !rateLimitInfo && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-destructive">Something went wrong</h4>
                      <p className="text-sm text-destructive/80 mt-1">
                        Please try again. If the issue persists, try refreshing the page.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={onRetry}
                      className="text-destructive border-destructive/20 hover:bg-destructive/10"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {children}
    </div>
  );
}