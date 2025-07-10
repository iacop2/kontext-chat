'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { useTRPC } from '@/trpc/client';
import { useSubscription } from '@trpc/tanstack-react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, User, Bot, Image as ImageIcon } from 'lucide-react';

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

  const trpc = useTRPC();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get the currently active generations
  const activeCreateGeneration = Object.entries(generations).find(([_, gen]) => gen.type === 'create' && gen.status === 'generating');
  const [activeCreateId, activeCreateState] = activeCreateGeneration || [null, null];

  const activeEditGeneration = Object.entries(generations).find(([_, gen]) => gen.type === 'edit' && gen.status === 'generating');
  const [activeEditId, activeEditState] = activeEditGeneration || [null, null];

  // Setup create subscription
  const createSubscription = useSubscription(
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
  const editSubscription = useSubscription(
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
          {/* Show source image for edits */}
          {isEdit && sourceImageUrl && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Source image:</p>
              <img
                src={sourceImageUrl}
                alt="Source image"
                className="w-full h-auto rounded-md border"
              />
            </div>
          )}

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
                className="w-full h-auto rounded-md border"
              />
              <Badge className="absolute top-2 right-2" variant="secondary">
                Streaming
              </Badge>
            </div>
          )}

          {/* Show final image when complete */}
          {status === 'complete' && finalImage && (
            <div>
              {isEdit && (
                <p className="text-sm text-muted-foreground mb-2">Result:</p>
              )}
              <img
                src={finalImage}
                alt={isEdit ? "Edited result" : "Created result"}
                className="w-full h-auto rounded-md border"
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

      {/* Input form */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            sendMessage({ text: input });
            setInput('');
          }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-background"
            />
            <Button type="submit" disabled={!input.trim() || status !== 'ready' || !!activeCreateId || !!activeEditId}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}