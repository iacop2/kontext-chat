'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, ArrowUp, X } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ChatMessage } from '@/components/ChatMessage';
import { ImagePreview } from '@/components/ImagePreview';
import { ChatHeader } from '@/components/ChatHeader';



export default function Chat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    uploadState,
    handleFileUpload,
    handleRemoveUpload,
    uploadImageMutation,
    fileInputRef
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && status === 'ready' && !uploadState.isUploading && !uploadImageMutation.isPending) {
        handleSubmit(e as any);
      }
    }
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Auto-resize when upload state changes
  useEffect(() => {
    autoResize();
  }, [uploadState.previewUrl, uploadState.isUploading]);





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

      <div className="p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              ref={fileInputRef}
            />
            {(uploadState.previewUrl || uploadState.isUploading) && (
              <div className="absolute top-2 left-3 z-10">
                {uploadState.isUploading ? (
                  <div className="relative inline-block mb-2">
                    <div className="relative w-14 h-14 bg-gray-200 rounded flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-gray-600"></div>
                    </div>
                  </div>
                ) : uploadState.previewUrl ? (
                  <div className="relative inline-block mb-2">
                    <div className="relative w-14 h-14">
                      <img
                        src={uploadState.previewUrl}
                        alt={uploadState.fileName}
                        className="w-full h-full object-cover rounded"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRemoveUpload}
                        className="absolute top-1 right-1 h-4 w-4 p-0 rounded bg-white text-black hover:bg-gray-100 border-0"
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className={`w-full resize-none rounded border border-stroke-base bg-background px-3 text-sm text-content placeholder:text-content-lighter focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${uploadState.previewUrl ? 'min-h-[80px] pt-20 pb-10' : 'min-h-[48px] py-2 pb-10'
                }`}
              style={{
                height: 'auto',
                overflow: 'hidden'
              }}
            />
            <div className="absolute bottom-0 left-0 p-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-fit w-fit p-1.5 rounded text-content-lighter hover:text-content bg-transparent border-0 hover:bg-surface-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadState.isUploading || uploadImageMutation.isPending}
              >
                <Paperclip className="h-3.5 w-3.5 -rotate-45" />
              </Button>
            </div>
            <div className="absolute bottom-0 right-0 p-2">
              <Button
                type="submit"
                size="sm"
                className="h-fit w-fit p-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded border"
                disabled={!input.trim() || status !== 'ready' || uploadState.isUploading || uploadImageMutation.isPending}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}