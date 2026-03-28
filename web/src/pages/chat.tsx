import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import Layout from '@/components/Layout';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  memory_context?: Array<{ date: string; summary: string }>;
  created_at?: string;
}

interface MemoryMeta {
  session_count: number;
  last_session_days_ago?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function TypingIndicator() {
  return (
    <div className="typing-indicator" role="status" aria-label="Hardev is typing">
      <span />
      <span />
      <span />
      <style jsx>{`
        .typing-indicator {
          display: flex;
          gap: 5px;
          padding: 12px 16px;
          background: #ffffff;
          border-radius: 12px 12px 12px 4px;
          width: fit-content;
          box-shadow: 0 1px 4px rgba(27, 31, 74, 0.08);
        }
        .typing-indicator span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6b6b8a;
          animation: bounce 1.2s ease-in-out infinite;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

const ChatPage: NextPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [memoryMeta, setMemoryMeta] = useState<MemoryMeta | null>(null);
  const [sessionId] = useState(genSessionId);
  const [msgCount, setMsgCount] = useState(0);
  const [msgLimit] = useState(5); // trial default
  const [isTrial] = useState(true); // TODO: read from profile
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api.getChatHistory()
      .then((data: any) => {
        const msgs: ChatMessage[] = Array.isArray(data) ? data : data.messages ?? [];
        setMessages(msgs);
        if (data.memory_meta) setMemoryMeta(data.memory_meta);
        if (data.session_count !== undefined) {
          setMemoryMeta({ session_count: data.session_count, last_session_days_ago: data.last_session_days_ago });
        }
      })
      .catch(() => {/* start fresh */})
      .finally(() => setLoadingHistory(false));
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setMsgCount((c) => c + 1);

    try {
      const res = await api.chat(text, sessionId);
      const assistantMsg: ChatMessage = {
        id: res.id ?? `asst_${Date.now()}`,
        role: 'assistant',
        content: res.content ?? res.message ?? res.response ?? '',
        memory_context: res.memory_context,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const isPaywall = err?.status === 402;
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: isPaywall
            ? 'Your trial has ended. Upgrade to continue chatting with Hardev.'
            : 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remainingMsgs = Math.max(0, msgLimit - msgCount);

  return (
    <Layout>
      <Head>
        <title>Chat · JyotishHardev</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="chat-page">
        {/* Memory strip */}
        <div className="memory-strip">
          {memoryMeta ? (
            <>
              🧠 Remembers {memoryMeta.session_count} session{memoryMeta.session_count !== 1 ? 's' : ''}
              {memoryMeta.last_session_days_ago !== undefined && (
                <> · Last: {memoryMeta.last_session_days_ago === 0 ? 'today' : `${memoryMeta.last_session_days_ago}d ago`}</>
              )}
            </>
          ) : (
            <>🧠 JyotishHardev remembers your sessions</>
          )}
        </div>

        {/* Message list */}
        <div className="message-list" ref={listRef} role="log" aria-live="polite" aria-label="Chat messages">
          {loadingHistory ? (
            <div className="loading-messages">
              <div className="spinner" aria-label="Loading chat history" />
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-icon" aria-hidden="true">⊕</div>
              <p className="empty-title">Start your first session</p>
              <p className="empty-body">
                Ask me anything about your chart, your year ahead, or what&apos;s on your mind.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-wrap message-wrap--${msg.role}`}
                >
                  <div className={`bubble bubble--${msg.role}`}>
                    {msg.content}
                  </div>
                  {msg.role === 'assistant' && msg.memory_context && msg.memory_context.length > 0 && (
                    <div className="memory-chips">
                      {msg.memory_context.slice(0, 2).map((ctx, idx) => (
                        <span key={idx} className="memory-chip">
                          💡 Based on {ctx.date} session
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="message-wrap message-wrap--assistant">
                  <TypingIndicator />
                </div>
              )}
            </>
          )}
        </div>

        {/* Input area */}
        <div className="input-area">
          {isTrial && (
            <div className="trial-counter" aria-live="polite">
              {remainingMsgs} / {msgLimit} msgs today
            </div>
          )}
          <div className="input-row">
            <textarea
              ref={textareaRef}
              className="input-box"
              placeholder="Ask Hardev…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              aria-label="Message input"
              disabled={sending}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              aria-label="Send message"
            >
              {sending ? '…' : '↑'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .chat-page {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 64px); /* subtract bottom nav */
          background: #f5f0e8;
        }

        .memory-strip {
          background: #1b1f4a;
          color: #ffffff;
          font-size: 12px;
          text-align: center;
          padding: 10px 16px;
          flex-shrink: 0;
          letter-spacing: 0.3px;
        }

        .message-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .loading-messages {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #e8e2d9;
          border-top-color: #1b1f4a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 24px;
        }

        .empty-icon {
          font-size: 48px;
          color: #c9a84c;
          margin-bottom: 16px;
        }

        .empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #1b1f4a;
          margin-bottom: 8px;
        }

        .empty-body {
          font-size: 14px;
          color: #6b6b8a;
          line-height: 1.6;
          max-width: 280px;
        }

        /* Messages */
        .message-wrap {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .message-wrap--user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .message-wrap--assistant {
          align-self: flex-start;
          align-items: flex-start;
        }

        .bubble {
          padding: 12px 16px;
          font-size: 15px;
          line-height: 1.6;
          border-radius: 12px;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .bubble--user {
          background: #1b1f4a;
          color: #ffffff;
          border-bottom-right-radius: 4px;
        }

        .bubble--assistant {
          background: #ffffff;
          color: #1a1a2e;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 4px rgba(27, 31, 74, 0.08);
        }

        .memory-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }

        .memory-chip {
          background: #f5f0e8;
          border: 1px solid #e0dbd0;
          border-radius: 12px;
          padding: 3px 10px;
          font-size: 11px;
          color: #6b6b8a;
        }

        /* Input */
        .input-area {
          flex-shrink: 0;
          background: #ffffff;
          border-top: 1px solid #e8e2d9;
          padding: 8px 12px 12px;
        }

        .trial-counter {
          font-size: 12px;
          color: #6b6b8a;
          text-align: right;
          margin-bottom: 6px;
        }

        .input-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .input-box {
          flex: 1;
          padding: 12px 14px;
          font-size: 15px;
          border: 1.5px solid #e0dbd0;
          border-radius: 12px;
          background: #f9f7f2;
          color: #1a1a2e;
          resize: none;
          outline: none;
          min-height: 44px;
          max-height: 120px;
          line-height: 1.5;
          font-family: inherit;
          transition: border-color 150ms ease;
        }

        .input-box:focus {
          border-color: #1b1f4a;
          background: #ffffff;
        }

        .send-btn {
          width: 44px;
          height: 44px;
          background: #1b1f4a;
          color: #ffffff;
          border: none;
          border-radius: 50%;
          font-size: 18px;
          font-weight: 700;
          flex-shrink: 0;
          cursor: pointer;
          transition: opacity 150ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-btn:hover:not(:disabled) {
          opacity: 0.88;
        }

        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </Layout>
  );
};

export default ChatPage;
