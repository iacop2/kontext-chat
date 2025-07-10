'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useTRPC } from '@/trpc/client';
import { useSubscription } from '@trpc/tanstack-react-query';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, User, Bot, Image as ImageIcon, Upload, X } from 'lucide-react';

// Consolidated state type for image generations
type GenerationState = {
  prompt: string;
  type: 'create' | 'edit';
  sourceImageUrl?: string;
  status: 'idle' | 'generating' | 'complete' | 'error';
  streamingImage?: string;
  finalImage?: string;
  error?: string;
};

export default function Chat() {
  const [input, setInput] = useState('');
  // Single state object for all generations
  const [generations, setGenerations] = useState<Record<string, GenerationState>>({});

  // Upload state management
  const [uploadState, setUploadState] = useState<{
    isUploading: boolean;
    uploadedImage?: string;
    fileName?: string;
    previewUrl?: string;
  }>({ isUploading: false });

  const trpc = useTRPC();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload mutation
  const uploadImageMutation = useMutation(trpc.uploadImage.mutationOptions());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // File handling functions
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      setUploadState({ isUploading: true });

      // Convert to data URL for preview
      const previewUrl = await fileToDataURL(file);
      setUploadState(prev => ({ ...prev, previewUrl, fileName: file.name }));

      // Upload via tRPC
      const result = await uploadImageMutation.mutateAsync({ image: previewUrl });

      // Store uploaded URL
      setUploadState({
        isUploading: false,
        uploadedImage: result.url,
        fileName: file.name,
        previewUrl
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadState({ isUploading: false });
      alert('Upload failed. Please try again.');
    }
  };

  const handleRemoveUpload = () => {
    setUploadState({ isUploading: false });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get the currently active generations
  const activeCreateGeneration = Object.entries(generations).find(([_, gen]) => gen.type === 'create' && gen.status === 'generating');
  const [activeCreateId, activeCreateState] = activeCreateGeneration || [null, null];

  const activeEditGeneration = Object.entries(generations).find(([_, gen]) => gen.type === 'edit' && gen.status === 'generating');
  const [activeEditId, activeEditState] = activeEditGeneration || [null, null];

  // Setup create subscription
  useSubscription(
    trpc.generateImageStream.subscriptionOptions(
      activeCreateState ? {
        prompt: activeCreateState.prompt,
      } : { prompt: "" },
      {
        enabled: !!activeCreateState,
        onData: (data: any) => {
          if (!activeCreateId) return;

          const eventData = data.data;

          if (eventData.type === "progress") {
            const event = eventData.data;
            if (event.images && event.images.length > 0) {
              setGenerations(prev => ({
                ...prev,
                [activeCreateId]: {
                  ...prev[activeCreateId],
                  streamingImage: event.images[0].url
                }
              }));
            }
          } else if (eventData.type === "complete") {
            console.log("Generate completion event:", eventData);
            const generation = generations[activeCreateId];

            setGenerations(prev => ({
              ...prev,
              [activeCreateId]: {
                ...prev[activeCreateId],
                status: 'complete',
                finalImage: eventData.imageUrl,
                streamingImage: undefined
              }
            }));

            // Add tool result with the final image URL
            addToolResult({
              toolCallId: activeCreateId,
              output: {
                imageUrl: eventData.imageUrl,
                prompt: generation?.prompt || ''
              }
            });
          } else if (eventData.type === "error") {
            setGenerations(prev => ({
              ...prev,
              [activeCreateId]: {
                ...prev[activeCreateId],
                status: 'error',
                error: eventData.error,
                streamingImage: undefined
              }
            }));
          }
        },
        onError: (error) => {
          if (!activeCreateId) return;
          setGenerations(prev => ({
            ...prev,
            [activeCreateId]: {
              ...prev[activeCreateId],
              status: 'error',
              error: error.message,
              streamingImage: undefined
            }
          }));
        },
      },
    ),
  );

  // Setup edit subscription
  useSubscription(
    trpc.editImageStream.subscriptionOptions(
      activeEditState ? {
        prompt: activeEditState.prompt,
        imageUrl: activeEditState.sourceImageUrl!,
      } : { prompt: "", imageUrl: "" },
      {
        enabled: !!activeEditState,
        onData: (data: any) => {
          if (!activeEditId) return;

          const eventData = data.data;

          if (eventData.type === "progress") {
            const event = eventData.data;
            if (event.images && event.images.length > 0) {
              setGenerations(prev => ({
                ...prev,
                [activeEditId]: {
                  ...prev[activeEditId],
                  streamingImage: event.images[0].url
                }
              }));
            }
          } else if (eventData.type === "complete") {
            const generation = generations[activeEditId];

            setGenerations(prev => ({
              ...prev,
              [activeEditId]: {
                ...prev[activeEditId],
                status: 'complete',
                finalImage: eventData.imageUrl,
                streamingImage: undefined
              }
            }));

            // Add tool result with the final edited image URL
            addToolResult({
              toolCallId: activeEditId,
              output: {
                imageUrl: eventData.imageUrl,
                prompt: generation?.prompt || '',
                sourceImageUrl: generation?.sourceImageUrl || ''
              }
            });
          } else if (eventData.type === "error") {
            setGenerations(prev => ({
              ...prev,
              [activeEditId]: {
                ...prev[activeEditId],
                status: 'error',
                error: eventData.error,
                streamingImage: undefined
              }
            }));
          }
        },
        onError: (error) => {
          if (!activeEditId) return;
          setGenerations(prev => ({
            ...prev,
            [activeEditId]: {
              ...prev[activeEditId],
              status: 'error',
              error: error.message,
              streamingImage: undefined
            }
          }));
        },
      },
    ),
  );

  const { messages, sendMessage, status, addToolResult } = useChat({
    maxSteps: 5,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'startCreateImage') {
        const input = toolCall.input as { prompt: string };

        // Initialize generation state
        setGenerations(prev => ({
          ...prev,
          [toolCall.toolCallId]: {
            prompt: input.prompt,
            type: 'create',
            status: 'generating'
          }
        }));

        return toolCall.input;
      } else if (toolCall.toolName === 'startEditImage') {
        const input = toolCall.input as { prompt: string; imageUrl: string };

        // Initialize edit state
        setGenerations(prev => ({
          ...prev,
          [toolCall.toolCallId]: {
            prompt: input.prompt,
            type: 'edit',
            sourceImageUrl: input.imageUrl,
            status: 'generating'
          }
        }));

        return toolCall.input;
      }
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  console.log(messages);


  const renderImageGeneration = (toolCallId: string) => {
    const generation = generations[toolCallId];
    if (!generation) return null;

    const { type, status, streamingImage, finalImage, error, sourceImageUrl } = generation;
    const isEdit = type === 'edit';

    return (
      <Card className="mt-3">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <CardTitle className="text-sm">
              {status === 'generating' ?
                (isEdit ? 'Editing image...' : 'Generating image...') :
                status === 'error' ?
                  (isEdit ? 'Edit failed' : 'Generation failed') :
                  (isEdit ? 'Edited image' : 'Generated image')}
            </CardTitle>
            <Badge variant={isEdit ? 'outline' : 'default'}>
              {isEdit ? 'Edit' : 'Generate'}
            </Badge>
            <Badge variant={status === 'generating' ? 'secondary' :
              status === 'error' ? 'destructive' : 'default'}>
              {status === 'generating' ? 'In progress' :
                status === 'error' ? 'Error' :
                  'Complete'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">

          {/* Show loading skeleton during creation without image */}
          {status === 'generating' && !streamingImage && (
            <Skeleton className="w-full h-48 rounded-md" />
          )}

          {/* Show streaming image during creation */}
          {status === 'generating' && streamingImage && (
            <div className="relative">
              <img
                src={streamingImage}
                alt="Streaming generation"
                className="w-full h-auto max-h-96 object-contain rounded-md border"
              />
              <Badge className="absolute top-2 right-2" variant="secondary">
                Streaming
              </Badge>
            </div>
          )}

          {/* Show final image when complete */}
          {status === 'complete' && finalImage && (
            <div>
              <img
                src={finalImage}
                alt={isEdit ? "Edited result" : "Created result"}
                className="w-full h-auto max-h-96 object-contain rounded-md border"
              />
            </div>
          )}

          {/* Show error message */}
          {error && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-center">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Kontext Chat</h1>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(message => (
            <div key={message.id} className="flex gap-3">
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

                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        // Check if this is a user message with uploaded image
                        if (message.role === 'user' && part.text.includes('[User has uploaded an image:')) {
                          const imageUrlMatch = part.text.match(/\[User has uploaded an image: (.*?)\]/);
                          const imageUrl = imageUrlMatch?.[1];
                          const remainingText = part.text.replace(/\[User has uploaded an image: .*?\]\s*/, '');

                          return (
                            <div key={`${message.id}-${i}`} className="space-y-3">
                              {imageUrl && (
                                <Card className="mt-3">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                      <ImageIcon className="h-4 w-4" />
                                      <CardTitle className="text-sm">Uploaded Image</CardTitle>
                                      <Badge variant="outline">Upload</Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    <img
                                      src={imageUrl}
                                      alt="Uploaded image"
                                      className="w-full h-auto max-h-96 object-contain rounded-md border"
                                    />
                                  </CardContent>
                                </Card>
                              )}
                              {remainingText && (
                                <div className="prose prose-sm max-w-none">
                                  {remainingText}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div key={`${message.id}-${i}`} className="prose prose-sm max-w-none">
                            {part.text}
                          </div>
                        );
                      case 'tool-startCreateImage':
                        return (
                          <div key={`${message.id}-${i}`}>
                            {renderImageGeneration(part.toolCallId)}
                          </div>
                        );
                      case 'tool-startEditImage':
                        return (
                          <div key={`${message.id}-${i}`}>
                            {renderImageGeneration(part.toolCallId)}
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Image preview */}
      {(uploadState.previewUrl || uploadState.isUploading) && (
        <div className="border-t bg-muted/30 p-4">
          <div className="max-w-3xl mx-auto">
            <Card className="max-w-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {uploadState.isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="text-sm">Uploading...</span>
                    </div>
                  ) : uploadState.previewUrl ? (
                    <>
                      <img
                        src={uploadState.previewUrl}
                        alt={uploadState.fileName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{uploadState.fileName}</p>
                        <p className="text-xs text-muted-foreground">Ready for editing</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRemoveUpload}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Input form */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <form
          onSubmit={e => {
            e.preventDefault();

            // Include uploaded image info in message if available
            let messageText = input;
            if (uploadState.uploadedImage) {
              messageText = `[User has uploaded an image: ${uploadState.uploadedImage}] ${input}`;
            }

            sendMessage({ text: messageText });
            setInput('');

            // Clear upload state after sending any message
            if (uploadState.uploadedImage || uploadState.previewUrl) {
              handleRemoveUpload();
            }
          }}
          className="max-w-3xl mx-auto"
        >
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
            <Button type="submit" disabled={!input.trim() || status !== 'ready' || !!activeCreateId || !!activeEditId || uploadState.isUploading || uploadImageMutation.isPending}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}