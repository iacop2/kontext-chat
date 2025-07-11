'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useTRPC } from '@/trpc/client';
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


export default function Chat() {
  const [input, setInput] = useState('');

  // Upload state management
  const [uploadState, setUploadState] = useState<{
    isUploading: boolean;
    uploadedImage?: string;
    fileName?: string;
    previewUrl?: string;
  }>({ isUploading: false });

  // Streaming generation state
  const [streamingGenerations, setStreamingGenerations] = useState<{
    [key: string]: {
      status: string;
      streamingImage?: string;
      prompt: string;
      type: 'create' | 'edit';
    }
  }>({});

  // Streaming description state
  const [streamingDescriptions, setStreamingDescriptions] = useState<{
    [key: string]: {
      description: string;
    }
  }>({});

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



  const { messages, sendMessage, status } = useChat({
    maxSteps: 5,
    onData: (dataPart) => {
      // Handle streaming image generation updates
      if (dataPart.type === 'data-image-generation') {
        setStreamingGenerations(prev => ({
          ...prev,
          [dataPart.id]: dataPart.data
        }));
      }
      
      // Handle streaming image description updates
      if (dataPart.type === 'data-image-description') {
        setStreamingDescriptions(prev => ({
          ...prev,
          [dataPart.id]: dataPart.data
        }));
      }
    },
  });
  function truncateStringsInObject(obj: any, maxLength = 100) {
    const seen = new WeakSet();

    function truncate(value: any): any {
      if (typeof value === 'string') {
        return value.length > maxLength
          ? value.slice(0, maxLength) + '... [truncated]'
          : value;
      } else if (Array.isArray(value)) {
        return value.map(truncate);
      } else if (value && typeof value === 'object') {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
        const result = {};
        for (const key in value) {
          result[key] = truncate(value[key]);
        }
        return result;
      }
      return value;
    }

    return truncate(obj);
  }
  console.log("messages", truncateStringsInObject(messages));

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingGenerations, streamingDescriptions]);

  // Clean up streaming generations when final images arrive
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.role === 'assistant') {
      const hasFiles = latestMessage.parts.some(part => part.type === 'file');
      const hasText = latestMessage.parts.some(part => part.type === 'text');
      if (hasFiles) {
        // Clear streaming generations when final images are received
        setStreamingGenerations({});
      }
      if (hasText) {
        // Clear streaming descriptions when final text is received
        setStreamingDescriptions({});
      }
    }
  }, [messages]);


  const renderImageGenerationNew = (data: any) => {
    const { status, type, streamingImage, error, progress, queuePosition } = data;
    const isEdit = type === 'edit';

    return (
      <Card className="mt-3">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <CardTitle className="text-sm">
              {status === 'starting' ?
                (isEdit ? 'Starting edit...' : 'Starting generation...') :
                status === 'queued' ?
                  (isEdit ? 'Edit queued...' : 'Generation queued...') :
                  status === 'generating' ?
                    (isEdit ? 'Editing image...' : 'Generating image...') :
                    status === 'error' ?
                      (isEdit ? 'Edit failed' : 'Generation failed') :
                      (isEdit ? 'Edited image' : 'Generated image')}
            </CardTitle>
            <Badge variant={isEdit ? 'outline' : 'default'}>
              {isEdit ? 'Edit' : 'Generate'}
            </Badge>
            <Badge variant={
              status === 'starting' || status === 'queued' || status === 'generating' ? 'secondary' :
                status === 'error' ? 'destructive' : 'default'}>
              {status === 'starting' ? 'Starting' :
                status === 'queued' ? 'Queued' :
                  status === 'generating' ? 'In progress' :
                    status === 'error' ? 'Error' :
                      'Complete'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Show queue position */}
          {status === 'queued' && queuePosition && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Queue position: {queuePosition}</p>
            </div>
          )}

          {/* Show progress */}
          {status === 'generating' && progress && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Progress: {Math.round(progress * 100)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Show streaming image during generation */}
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

          {/* Show loading skeleton during creation without image */}
          {(status === 'starting' || status === 'queued' || (status === 'generating' && !streamingImage)) && (
            <Skeleton className="w-full h-48 rounded-md" />
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
                      case 'file':
                        // Handle all file types (uploaded, generated, edited)
                        const isGeneratedImage = part.filename?.includes('generated-') || part.filename?.includes('edited-');
                        const isEditedImage = part.filename?.includes('edited-');

                        return (
                          <div key={`${message.id}-${i}`}>
                            <Card className="mt-3">
                              <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="h-4 w-4" />
                                  <CardTitle className="text-sm">
                                    {isEditedImage ? 'Edited Image' :
                                      isGeneratedImage ? 'Generated Image' :
                                        'Uploaded Image'}
                                  </CardTitle>
                                  <Badge variant={
                                    isEditedImage ? 'default' :
                                      isGeneratedImage ? 'secondary' :
                                        'outline'
                                  }>
                                    {isEditedImage ? 'Edit' :
                                      isGeneratedImage ? 'Generate' :
                                        'Upload'}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <img
                                  src={part.url}
                                  alt={part.filename || "Image"}
                                  className="w-full h-auto max-h-96 object-contain rounded-md border"
                                />
                              </CardContent>
                            </Card>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}

                  {/* Show streaming generations for this message */}
                  {message.role === 'assistant' && 
                    Object.entries(streamingGenerations).map(([id, generation]) => (
                      <div key={id}>
                        {renderImageGenerationNew(generation)}
                      </div>
                    ))
                  }

                  {/* Show streaming descriptions for this message */}
                  {message.role === 'assistant' && 
                    Object.entries(streamingDescriptions).map(([id, description]) => (
                      <div key={id} className="prose prose-sm max-w-none">
                        <div className="bg-muted/30 p-3 rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">Describing image...</div>
                          {description.description}
                        </div>
                      </div>
                    ))
                  }
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

            // Send message with files if uploaded image exists
            if (uploadState.uploadedImage) {
              sendMessage({
                role: 'user',
                parts: [
                  {
                    type: 'file' as const,
                    url: uploadState.uploadedImage,
                    filename: uploadState.fileName || 'uploaded-image',
                    mediaType: 'image/jpeg', // Default, could be detected from uploadState
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
            <Button type="submit" disabled={!input.trim() || status !== 'ready' || uploadState.isUploading || uploadImageMutation.isPending}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}