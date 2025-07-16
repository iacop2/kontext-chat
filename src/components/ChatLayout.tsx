import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatMessage } from '@/components/ChatMessage';
import { ExampleCards } from '@/components/ExampleCards';

interface ChatLayoutProps {
  messages: any[];
  error: any;
  onExampleSelect: (prompt: string, imageUrl?: string, styleId?: string) => void;
  onUseImageAsInput: (imageUrl: string) => void;
  onRetry: () => void;
  children: React.ReactNode;
}

export function ChatLayout({
  messages,
  error,
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

              {/* Error Display */}
              {error && (
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