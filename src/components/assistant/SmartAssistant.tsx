'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AssistantMessage, ApiResponse, UserRole } from '@/types';
import { Brain, Send } from 'lucide-react';
import { UI_CONFIG } from '@/config/constants';
import MarkdownView from '@/components/shared/MarkdownView';

interface SmartAssistantProps {
  readonly role: UserRole;
}

/** Context-aware Smart Care Assistant with conversational Q&A. */
export default function SmartAssistant({ role }: SmartAssistantProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    const userMsg: AssistantMessage = {
      role: 'user', content: message, timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, role }),
      });
      const data: ApiResponse<AssistantMessage> = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data as AssistantMessage]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  const handleInputChange = useCallback((val: string) => {
    setInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {}, UI_CONFIG.DEBOUNCE_MS);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  }, [input, sendMessage]);

  return (
    <section aria-labelledby="assistant-heading" className="flex flex-col h-full">
      <h2 id="assistant-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-accent" aria-hidden="true" />
        Smart Care Assistant
      </h2>

      <div className="flex-1 bg-surface border border-gray-800 rounded-xl p-4 overflow-y-auto max-h-96 space-y-3" aria-live="polite" aria-label="Assistant conversation">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">
            Ask me about your medications, appointments, or health routines.
          </p>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
              msg.role === 'user' ? 'bg-accent text-white' : 'bg-gray-800 text-gray-200'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <MarkdownView content={msg.content} />
              )}
              <p className="text-xs opacity-50 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-xl px-4 py-2 text-sm text-gray-400">
              Thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <label htmlFor="assistant-input" className="sr-only">Message the assistant</label>
        <input
          id="assistant-input"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Ask about your health..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-accent hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </section>
  );
}
