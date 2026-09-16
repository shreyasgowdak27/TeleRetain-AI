import { useState } from 'react';
import { Send, Bot, Loader2, X } from 'lucide-react';
import type { ChatMessage } from '../types';
import { answerQuestion } from '../lib/api';
import { useTheme } from '../lib/theme';

const SUGGESTION_CHIPS = [
  'Who is most at risk?',
  'Summarize retention offers',
  "What is today's churn rate?",
];

export function AISidebar({ onClose }: { onClose: () => void }) {
  const { tokens } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setBusy(true);
    try {
      const content = await answerQuestion(text);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I could not reach the database. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const handleChip = (chip: string) => setInput(chip);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  // Fixed-height flex column: header pinned, body scrolls, footer pinned.
  return (
    <aside
      className="flex flex-col h-full w-full"
      style={{ background: tokens.cardBg, minWidth: 0, minHeight: 0, overflow: 'hidden' }}
    >
      {/* Header — fixed at top, never scrolls */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ padding: 'clamp(12px, 2vw, 20px)', borderBottom: `1px solid ${tokens.cardBorder}`, minWidth: 0 }}
      >
        <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
          <h3
            className="font-semibold"
            style={{ color: tokens.textPrimary, fontSize: 'clamp(14px, 1.8vw, 16px)', whiteSpace: 'nowrap' }}
          >
            AI Assistant
          </h3>
          <span
            className="px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0"
            style={{ background: tokens.accentSoftBg, color: tokens.textPrimary, whiteSpace: 'nowrap' }}
          >
            Powered by RAG
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md transition-colors cursor-pointer shrink-0"
          style={{ color: tokens.textSecondary }}
          aria-label="Close assistant"
          title="Close assistant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body — scrollable middle, flex: 1. minHeight: 0 lets it shrink
          below its content so overflow-y-auto actually scrolls instead of
          growing and pushing the footer off-screen. */}
      <div className="flex-1 overflow-y-auto p-4 chat-scroll" style={{ minWidth: 0, minHeight: 0 }}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: tokens.accentSoftBg }}>
              <Bot className="w-8 h-8" style={{ color: tokens.textMuted }} />
            </div>
            <p
              className="mb-6 text-center"
              style={{ color: tokens.textSecondary, fontSize: 'clamp(13px, 1.6vw, 14px)', overflowWrap: 'break-word' }}
            >
              Ask me anything about<br />your customers
            </p>
            <div className="w-full space-y-2">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChip(chip)}
                  className="w-full text-left rounded-full transition-all duration-150 cursor-pointer"
                  style={{
                    border: `1px solid ${tokens.cardBorder}`,
                    color: tokens.textSecondary,
                    padding: 'clamp(10px, 1.5vw, 12px) clamp(14px, 2vw, 16px)',
                    fontSize: 'clamp(13px, 1.6vw, 14px)',
                    overflowWrap: 'break-word',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = tokens.accent;
                    e.currentTarget.style.color = tokens.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = tokens.cardBorder;
                    e.currentTarget.style.color = tokens.textSecondary;
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className="px-4 py-3 text-sm whitespace-pre-wrap"
                  style={{
                    maxWidth: '85%',
                    background: message.role === 'user' ? tokens.accent : tokens.cardBg,
                    color: message.role === 'user' ? (tokens.mode === 'dark' ? '#1A1A1A' : '#FFFFFF') : tokens.textPrimary,
                    border: message.role === 'assistant' ? `1px solid ${tokens.cardBorder}` : 'none',
                    borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    overflowWrap: 'break-word',
                  }}
                >
                  {message.content}
                </div>
                <span className="text-[11px] mt-1" style={{ color: tokens.textMuted }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-sm" style={{ color: tokens.textMuted }}>
                <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer — pinned at bottom, always reachable */}
      <div className="shrink-0 p-4" style={{ borderTop: `1px solid ${tokens.cardBorder}`, minWidth: 0 }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about customers..."
            className="flex-1 px-4 py-3 text-sm rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 cursor-pointer"
            style={{
              border: `1px solid ${tokens.inputBorder}`,
              background: tokens.inputBg,
              color: tokens.textPrimary,
              '--tw-ring-color': tokens.accent,
              minWidth: 0,
            } as React.CSSProperties}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || busy}
            className="px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{ background: tokens.accent, color: tokens.mode === 'dark' ? '#1A1A1A' : '#FFFFFF' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: tokens.textMuted }}>
          Shift+Enter for new line
        </p>
      </div>
    </aside>
  );
}
