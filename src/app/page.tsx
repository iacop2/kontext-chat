'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useStyleSelection } from '@/hooks/useStyleSelection';
import { useChatHandlers } from '@/hooks/useChatHandlers';
import { StyleSelectionDialog } from '@/components/StyleSelectionDialog';
import { ChatLayout } from '@/components/ChatLayout';
import { ChatInput } from '@/components/ChatInput';
import { logMessages } from '@/lib/utils';
import { getStoredApiKey } from '@/lib/api-key-storage';
import { DefaultChatTransport } from 'ai';


export default function Chat() {
  const [input, setInput] = useState('');
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    uploadState,
    handleFileUpload,
    handleRemoveUpload,
    handleExampleImage,
    fileInputRef
  } = useFileUpload();

  const {
    styleState,
    handleStyleSelect,
    handleStyleRemove,
  } = useStyleSelection();

  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Load API key on mount and listen for changes
    const loadApiKey = () => {
      const storedKey = getStoredApiKey();
      setApiKey(storedKey);
    };

    loadApiKey();

    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fal-api-key') {
        loadApiKey();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for changes within the same tab
    const handleCustomStorageChange = () => {
      loadApiKey();
    };

    window.addEventListener('apiKeyChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('apiKeyChanged', handleCustomStorageChange);
    };
  }, []);

  const { messages, sendMessage, status, error, regenerate } = useChat({
    maxSteps: 1,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ id, messages, trigger, messageId }) => {
        // Get the current API key from storage at request time
        const currentApiKey = getStoredApiKey();
        return {
          body: {
            messages,
            id,
            trigger,
            messageId,
            apiKey: currentApiKey || undefined,
          },
        };
      },
    }),
    onError: (error) => {
      // Check if this is a rate limit error
      const isRateLimitError = error.message && (
        error.message.includes('Rate limit exceeded') ||
        error.message.includes('Free request limit exceeded') ||
        error.message.includes('429')
      );

      // Check if this is an API key error
      const isApiKeyError = error.message && (
        error.message.includes('Invalid FAL API key') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid API key')
      );

      if (isRateLimitError) {
        setRateLimitInfo({
          type: 'rate_limit_exceeded',
          message: error.message,
          isPermanent: true
        });
      } else if (isApiKeyError) {
        setRateLimitInfo({
          type: 'api_key_invalid',
          message: error.message,
          isPermanent: true
        });
      }
    },
  });

  logMessages("messages", messages);

  const handleSendMessage = (message: any) => {
    // Clear rate limit info when sending new message
    setRateLimitInfo(null);
    sendMessage(message);
  };

  const {
    handleSubmit,
    handleExampleSelect,
    handleUseImageAsInput,
  } = useChatHandlers({
    input,
    setInput,
    sendMessage: handleSendMessage,
    uploadState,
    styleState,
    handleRemoveUpload,
    handleStyleRemove,
    handleExampleImage,
    handleStyleSelect,
    textareaRef
  });

  const isSubmitting = status !== 'ready' && !error;

  return (
    <ChatLayout
      messages={messages}
      error={error}
      rateLimitInfo={rateLimitInfo}
      apiKey={apiKey}
      onExampleSelect={handleExampleSelect}
      onUseImageAsInput={handleUseImageAsInput}
      onRetry={() => regenerate()}
    >
      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        uploadState={uploadState}
        styleState={styleState}
        onFileUpload={handleFileUpload}
        onRemoveUpload={handleRemoveUpload}
        onRemoveStyle={handleStyleRemove}
        onOpenStyleDialog={() => setIsStyleDialogOpen(true)}
        fileInputRef={fileInputRef}
        textareaRef={textareaRef}
        isSubmitting={isSubmitting}
      />
      <StyleSelectionDialog
        open={isStyleDialogOpen}
        onOpenChange={setIsStyleDialogOpen}
        onStyleSelect={handleStyleSelect}
      />
    </ChatLayout>
  );
}