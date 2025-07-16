'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useStyleSelection } from '@/hooks/useStyleSelection';
import { useChatHandlers } from '@/hooks/useChatHandlers';
import { StyleSelectionDialog } from '@/components/StyleSelectionDialog';
import { ChatLayout } from '@/components/ChatLayout';
import { ChatInput } from '@/components/ChatInput';



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

  const { messages, sendMessage, status, error, regenerate } = useChat({
    maxSteps: 1,
  });

  const {
    handleSubmit,
    handleExampleSelect,
    handleUseImageAsInput,
  } = useChatHandlers({
    input,
    setInput,
    sendMessage,
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