import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CHAT_STARTERS } from '../../data/roadmapData';
import { chatAPI, getAnalysisChatHistory, getChatResponse } from '../../services/api';
import { getLastAnalysis } from '../../utils/lastAnalysis';

function formatMessageDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatMessageTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;

  for (const msg of messages) {
    const dateKey = msg.created_at
      ? new Date(msg.created_at).toDateString()
      : 'Today';
    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({ type: 'date', label: msg.created_at ? formatMessageDate(msg.created_at) : 'Today' });
    }
    groups.push({ type: 'message', ...msg });
  }
  return groups;
}

export default function CareerAssistant({ variant = 'dashboard' }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesRef = useRef(null);
  const autoScrollRef = useRef(false);
  const location = useLocation();

  const analysis = useMemo(
    () => location.state?.analysis || getLastAnalysis(),
    [location.state]
  );

  const career = analysis?.predicted_career || '';
  const analysisId = analysis?.id;
  const confidence = analysis?.confidence_pct
    ? `${Math.round(analysis.confidence_pct)}%`
    : analysis?.confidence_scores?.[career]
      ? `${Math.round(analysis.confidence_scores[career] * 100)}%`
      : '';

  const getStep = () => {
    if (location.pathname.includes('upload')) return 'upload';
    if (location.pathname.includes('profile')) return 'profile';
    if (location.pathname.includes('careers')) return 'careers';
    if (location.pathname.includes('roadmap')) return 'roadmap';
    if (location.pathname.includes('chat')) return 'chat';
    return 'dashboard';
  };

  const scrollMessagesToBottom = (behavior = 'auto') => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  useEffect(() => {
    if (variant === 'dashboard') {
      chatAPI
        .getHistory()
        .then((result) => {
            const rows = result.data || [];
            if (rows.length > 0) {
              setMessages(rows.map((m) => ({
                role: m.role,
                content: m.content,
                created_at: m.created_at,
              })));
            }
          setHistoryLoaded(true);
        })
        .catch(() => setHistoryLoaded(true));
      return;
    }

    if (analysisId) {
      getAnalysisChatHistory(analysisId)
        .then((result) => {
          const rows = result.data || [];
          if (rows.length > 0) {
            setMessages(rows.map((m) => ({
              role: m.role,
              content: m.content,
              created_at: m.created_at,
            })));
          }
          setHistoryLoaded(true);
        })
        .catch(() => setHistoryLoaded(true));
    } else {
      setHistoryLoaded(true);
    }
  }, [variant, analysisId]);

  useEffect(() => {
    if (!autoScrollRef.current) return;
    scrollMessagesToBottom('smooth');
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userMessage = text.trim();
    if (!userMessage || loading) return;

    autoScrollRef.current = true;
    setInput('');
    const now = new Date().toISOString();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, created_at: now }]);
    setLoading(true);

    try {
      const context =
        variant === 'dashboard'
          ? { step: getStep(), text: `User is on step: ${getStep()}. Exploring Rwanda tech careers.` }
          : career
            ? `Predicted career: ${career}${confidence ? ` (${confidence} confidence)` : ''}. User is exploring next steps in Rwanda tech.`
            : 'User is exploring career paths in Rwanda tech.';

      const chatHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await getChatResponse(userMessage, career, context, {
        analysisId: variant === 'standalone' ? analysisId : undefined,
        cvSummary: analysis?.narrative?.slice(0, 500),
        chatHistory,
      });

      const reply =
        result.data?.response ||
        result.response ||
        'Sorry, I could not generate a response.';

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, created_at: new Date().toISOString() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble responding. Please try again.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showStarters = historyLoaded && messages.length === 0;

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full page-enter">
      <div className="mb-4 shrink-0">
        <h1 className="page-title">Career Assistant</h1>
        <p className="page-subtitle mt-1.5">
          {career ? (
            <>
              Context:{' '}
              <span className="text-klenz-orange font-medium">{career}</span>
              {confidence && (
                <span className="text-klenz-muted"> · {confidence} match</span>
              )}
            </>
          ) : (
            'Ask anything about skills, careers, and next steps in Rwanda tech.'
          )}
        </p>
      </div>

      <div className="panel flex flex-col flex-1 min-h-0 overflow-hidden">
        <div
          ref={messagesRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-3"
        >
          {showStarters && (
            <div className="text-center py-4">
              <p className="text-klenz-muted text-sm mb-4">Try one of these questions:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {CHAT_STARTERS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-2 rounded-chip border border-klenz-border text-klenz-muted hover:border-klenz-orange hover:text-klenz-orange transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {grouped.map((item, i) =>
            item.type === 'date' ? (
              <div key={`date-${i}`} className="text-center">
                <span className="text-xs text-klenz-subtle bg-klenz-elevated px-3 py-1 rounded-full">
                  {item.label}
                </span>
              </div>
            ) : (
              <div
                key={`msg-${i}`}
                className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'} animate-slide-up`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    item.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
                  }`}
                >
                  {item.content}
                </div>
                {item.created_at && (
                  <span className="text-[10px] text-klenz-subtle mt-1 px-1">
                    {formatMessageTime(item.created_at)}
                  </span>
                )}
              </div>
            )
          )}

          {loading && (
            <div className="flex justify-start animate-slide-up">
              <div className="chat-bubble-ai px-4 py-2.5 text-sm">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-klenz-muted animate-typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-klenz-muted animate-typing-dot" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-klenz-muted animate-typing-dot" style={{ animationDelay: '0.4s' }} />
                </span>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="shrink-0 p-4 border-t border-klenz-border"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="input-dark flex-1 text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary px-5 disabled:opacity-50 shrink-0"
            >
              ↑
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
