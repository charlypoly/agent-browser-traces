'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold">Task Agent</h1>
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          <span className="font-medium">{message.role === 'user' ? 'You: ' : 'Agent: '}</span>
          {message.parts.map((part, i) => {
            if (part.type === 'text') return <span key={i}>{part.text}</span>;
            if (part.type.startsWith('tool-')) {
              return (
                <pre key={i} className="my-2 rounded bg-zinc-100 p-2 text-xs dark:bg-zinc-900">
                  {JSON.stringify(part, null, 2)}
                </pre>
              );
            }
            return null;
          })}
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="w-full rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900"
          value={input}
          disabled={status === 'streaming'}
          placeholder="Ask the agent to do something..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
      </form>
    </main>
  );
}
