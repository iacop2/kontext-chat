'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp, X, Palette, Image } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useStyleSelection } from '@/hooks/useStyleSelection';
import { StyleSelectionDialog } from '@/components/StyleSelectionDialog';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatHeader } from '@/components/ChatHeader';
import { ExampleCards } from '@/components/ExampleCards';
import { truncateStringsInObject } from '@/lib/utils';
import { styleModels } from '@/lib/models';



export default function Chat() {
  const [input, setInput] = useState('');
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    uploadState,
    handleFileUpload,
    handleRemoveUpload,
    handleExampleImage,
    uploadImageMutation,
    fileInputRef
  } = useFileUpload();

  const {
    styleState,
    handleStyleSelect,
    handleStyleRemove,
  } = useStyleSelection();

  // Handle style selection
  const handleStyleSelectWithPrompt = (style: any) => {
    handleStyleSelect(style);
  };

  const { messages, sendMessage, status, error, regenerate } = useChat({
    maxSteps: 1,
  });

  // TODO: remove debug logging when done
  console.log("messages", truncateStringsInObject(messages));
  // -------------

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || styleState.selectedStyle) && (status === 'ready' || error) && !uploadState.isUploading && !uploadImageMutation.isPending) {
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

  // Auto-resize when upload state or style selection changes
  useEffect(() => {
    autoResize();
  }, [uploadState.previewUrl, uploadState.isUploading, styleState.selectedStyle]);

  // Handle using generated image as input
  const handleUseImageAsInput = (imageUrl: string) => {
    // Clear current upload state and set the new image
    handleRemoveUpload();
    handleExampleImage(imageUrl, 'generated-image.jpg');
  };

  // Handle example selection
  const handleExampleSelect = (prompt: string, imageUrl?: string, styleId?: string) => {
    // Reset previous inputs first
    setInput('');
    handleRemoveUpload();
    handleStyleRemove();

    // Set new example data
    setInput(prompt);

    // If there's an image URL, load it using the new function
    if (imageUrl) {
      handleExampleImage(imageUrl, 'example-image.jpg');
    }

    // If there's a style ID, select the corresponding style
    if (styleId) {
      const style = styleModels.find(s => s.id === styleId);
      if (style) {
        handleStyleSelect(style);
      }
    }

    // Focus the textarea after setting the input
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare message parts
    const parts: Array<any> = [];

    // Add uploaded image if present
    if (uploadState.isExampleImage && uploadState.exampleImageUrl) {
      parts.push({
        type: 'file' as const,
        url: uploadState.exampleImageUrl,
        filename: uploadState.fileName || 'example-image',
        mediaType: 'image/jpeg',
      });
    } else if (uploadState.uploadedImage) {
      parts.push({
        type: 'file' as const,
        url: uploadState.uploadedImage,
        filename: uploadState.fileName || 'uploaded-image',
        mediaType: 'image/jpeg',
      });
    }

    // Add LoRA selection as data part if style is selected
    if (styleState.selectedStyle) {
      parts.push({
        type: 'data-lora-selection' as const,
        data: {
          id: styleState.selectedStyle.id,
          name: styleState.selectedStyle.name,
          loraUrl: styleState.selectedStyle.loraUrl,
          triggerWord: styleState.selectedStyle.triggerWord,
        },
      });
    }

    // Add text content (even if empty when style is selected)
    parts.push({
      type: 'text',
      text: input || '',
    });

    if (parts.length > 1) {
      sendMessage({
        role: 'user',
        parts,
      });
    } else {
      sendMessage({ text: input });
    }
    setInput('');

    // Clear upload state and style after sending
    if (uploadState.uploadedImage || uploadState.previewUrl) {
      handleRemoveUpload();
    }
    if (styleState.selectedStyle) {
      handleStyleRemove();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader />

      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <ExampleCards onExampleSelect={handleExampleSelect} />
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto space-y-4 p-4">
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} onUseAsInput={handleUseImageAsInput} />
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
                      onClick={() => regenerate()}
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
            {(uploadState.previewUrl || uploadState.isUploading || styleState.selectedStyle) && (
              <div className="absolute top-2 left-3 z-10 flex gap-2">
                {/* Image Preview */}
                {(uploadState.previewUrl || uploadState.isUploading) && (
                  <div className="relative">
                    {uploadState.isUploading ? (
                      <div className="relative inline-block mb-2">
                        <div className="relative w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-gray-600"></div>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black/70 rounded p-0.5">
                          <Image className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    ) : uploadState.previewUrl ? (
                      <div className="relative inline-block mb-2">
                        <div className="relative w-20 h-20">
                          <img
                            src={uploadState.previewUrl}
                            alt={uploadState.fileName}
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute bottom-1 left-1 bg-black/70 rounded p-0.5">
                            <Image className="h-3.5 w-3.5 text-white" />
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleRemoveUpload}
                            className="absolute top-1 right-1 h-5 w-5 p-0 rounded bg-white text-black hover:bg-gray-100 border-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Style Preview */}
                {styleState.selectedStyle && (
                  <div className="relative">
                    <div className="relative inline-block mb-2">
                      <div className="relative w-20 h-20">
                        <img
                          src={styleState.selectedStyle.imageSrc}
                          alt={styleState.selectedStyle.name}
                          className="w-full h-full object-cover rounded"
                        />
                        <div className="absolute bottom-1 left-1 bg-black/70 rounded p-0.5">
                          <Palette className="h-3.5 w-3.5 text-white" />
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleStyleRemove}
                          className="absolute top-1 right-1 h-5 w-5 p-0 rounded bg-white text-black hover:bg-gray-100 border-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
              placeholder="Upload an image to edit, or describe what you'd like to create"
              className={`w-full resize-none rounded border border-stroke-base bg-background px-3 text-sm text-content placeholder:text-content-lighter focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${(uploadState.previewUrl || styleState.selectedStyle) ? 'min-h-[100px] pt-28 pb-10' : 'min-h-[48px] py-2 pb-10'
                }`}
              style={{
                height: 'auto',
                overflow: 'hidden'
              }}
            />
            <div className="absolute bottom-0 left-0 p-2 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-fit w-fit px-2 py-1.5 rounded text-content-lighter hover:text-content bg-transparent border-0 hover:bg-surface-secondary flex items-center gap-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadState.isUploading || uploadImageMutation.isPending}
              >
                <Image className="h-3.5 w-3.5" />
                <span className="text-xs">Image</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-fit w-fit px-2 py-1.5 rounded text-content-lighter hover:text-content bg-transparent border-0 hover:bg-surface-secondary flex items-center gap-1"
                onClick={() => setIsStyleDialogOpen(true)}
              >
                <Palette className="h-3.5 w-3.5" />
                <span className="text-xs">Style</span>
              </Button>
            </div>
            <div className="absolute bottom-0 right-0 p-2">
              <Button
                type="submit"
                size="sm"
                className="h-fit w-fit p-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded border"
                disabled={(!input.trim() && !styleState.selectedStyle) || (status !== 'ready' && !error) || uploadState.isUploading || uploadImageMutation.isPending}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </form>
        <StyleSelectionDialog
          open={isStyleDialogOpen}
          onOpenChange={setIsStyleDialogOpen}
          onStyleSelect={handleStyleSelectWithPrompt}
        />
      </div>
    </div>
  );
}