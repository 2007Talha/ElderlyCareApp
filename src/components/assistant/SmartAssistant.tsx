'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AssistantMessage, ApiResponse, UserRole } from '@/types';
import { Sparkles, Send } from 'lucide-react';
import MarkdownView from '@/components/shared/MarkdownView';
import TelemetryBar, { GuardrailsTelemetry } from '@/components/shared/TelemetryBar';

interface SmartAssistantProps {
  readonly role: UserRole;
}

/** Context-aware Smart Care Assistant with conversational Q&A. */
export default function SmartAssistant({ role }: SmartAssistantProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [telemetry, setTelemetry] = useState<GuardrailsTelemetry | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim().slice(0, 1000), role }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data: ApiResponse<AssistantMessage & { telemetry?: GuardrailsTelemetry }> = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data as AssistantMessage]);
        if (data.data.telemetry) setTelemetry(data.data.telemetry);
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

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  }, [input, sendMessage]);

  return (
    <section aria-labelledby="assistant-heading" className="flex flex-col h-full">
      <h2 id="assistant-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-teal-400" aria-hidden="true" />
        Smart Care Assistant
      </h2>

      <div className="flex-1 bg-surface border border-border-color rounded-xl p-4 overflow-y-auto max-h-96 space-y-3 shadow-sm" aria-live="polite" aria-label="Assistant conversation">
        {messages.length === 0 && (
          <p className="text-text-secondary text-sm text-center py-8">
            Ask me about your medications, appointments, or health routines.
          </p>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
              msg.role === 'user' ? 'bg-teal-600 text-white shadow-sm font-medium' : 'bg-card-subtle text-text-primary border border-border-color'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <MarkdownView content={msg.content} />
              )}
              <p className="text-xs opacity-60 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card-subtle rounded-xl px-4 py-2 text-sm text-text-secondary border border-border-color">
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
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your health..."
          className="flex-1 bg-card-subtle border border-border-color rounded-lg px-4 py-2 text-text-primary"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      <TelemetryBar telemetry={telemetry} />
    </section>
  );
}
