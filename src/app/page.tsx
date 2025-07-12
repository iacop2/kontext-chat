'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ChatMessage } from '@/components/ChatMessage';
import { ImagePreview } from '@/components/ImagePreview';
import { ChatHeader } from '@/components/ChatHeader';



export default function Chat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    uploadState,
    handleFileUpload,
    handleRemoveUpload,
    uploadImageMutation 
  } = useFileUpload();

  const { messages, sendMessage, status } = useChat({
    maxSteps: 5,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);





  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadState.uploadedImage) {
      sendMessage({
        role: 'user',
        parts: [
          {
            type: 'file' as const,
            url: uploadState.uploadedImage,
            filename: uploadState.fileName || 'uploaded-image',
            mediaType: 'image/jpeg',
          },
          {
            type: 'text',
            text: input,
          },
        ],
      });
    } else {
      sendMessage({ text: input });
    }
    setInput('');

    if (uploadState.uploadedImage || uploadState.previewUrl) {
      handleRemoveUpload();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader />

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <ImagePreview 
        uploadState={uploadState}
        onRemove={handleRemoveUpload}
      />

      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              ref={fileInputRef}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadState.isUploading || uploadImageMutation.isPending}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-background"
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || status !== 'ready' || uploadState.isUploading || uploadImageMutation.isPending}
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}