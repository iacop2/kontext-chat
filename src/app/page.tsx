'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useSubscription } from '@trpc/tanstack-react-query';

// Consolidated state type for image generations
type GenerationState = {
  prompt: string;
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

  // Get the currently active generation
  const activeGeneration = Object.entries(generations).find(([_, gen]) => gen.status === 'generating');
  const [activeId, activeState] = activeGeneration || [null, null];

  // Setup subscription only when there's an active generation
  const subscription = useSubscription(
    trpc.generateImageStream.subscriptionOptions(
      activeState ? {
        prompt: activeState.prompt,
      } : { prompt: "" },
      {
        enabled: !!activeState,
        onData: (data: any) => {
          if (!activeId) return;

          const eventData = data.data;

          if (eventData.type === "progress") {
            const event = eventData.data;
            if (event.images && event.images.length > 0) {
              setGenerations(prev => ({
                ...prev,
                [activeId]: {
                  ...prev[activeId],
                  streamingImage: event.images[0].url
                }
              }));
            }
          } else if (eventData.type === "complete") {
            setGenerations(prev => ({
              ...prev,
              [activeId]: {
                ...prev[activeId],
                status: 'complete',
                finalImage: eventData.imageUrl,
                streamingImage: undefined
              }
            }));
          } else if (eventData.type === "error") {
            setGenerations(prev => ({
              ...prev,
              [activeId]: {
                ...prev[activeId],
                status: 'error',
                error: eventData.error,
                streamingImage: undefined
              }
            }));
          }
        },
        onError: (error) => {
          if (!activeId) return;
          setGenerations(prev => ({
            ...prev,
            [activeId]: {
              ...prev[activeId],
              status: 'error',
              error: error.message,
              streamingImage: undefined
            }
          }));
        },
      },
    ),
  );

  const { messages, sendMessage } = useChat({
    maxSteps: 5,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'generateImage') {
        const input = toolCall.input as { prompt: string };

        // Initialize generation state
        setGenerations(prev => ({
          ...prev,
          [toolCall.toolCallId]: {
            prompt: input.prompt,
            status: 'generating'
          }
        }));

        return toolCall.input;
      }
    },
  });
  console.log(messages);

  const renderImageGeneration = (toolCallId: string) => {
    const generation = generations[toolCallId];
    if (!generation) return null;

    const { status, streamingImage, finalImage, error } = generation;

    return (
      <div className="mt-2">
        <div className="text-sm text-gray-600 mb-2">
          {status === 'generating' ? 'Generating image...' :
            status === 'error' ? 'Error generating image' :
              ''}
        </div>

        {/* Show streaming image during generation */}
        {status === 'generating' && streamingImage && (
          <img
            src={streamingImage}
            alt="Streaming generation"
            className="max-w-full h-auto rounded border"
          />
        )}

        {/* Show final image when complete */}
        {finalImage && (
          <img
            src={finalImage}
            alt="Generated result"
            className="max-w-full h-auto rounded border"
          />
        )}

        {/* Show error message */}
        {error && (
          <div className="text-red-600 text-sm mt-2">{error}</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
              case 'tool-generateImage':
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
      ))}

      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 rounded shadow-xl text-white"
          value={input}
          placeholder="Say something..."
          onChange={e => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}