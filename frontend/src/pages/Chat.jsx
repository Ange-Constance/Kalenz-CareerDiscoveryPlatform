import { useState, useEffect, useRef, useMemo } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { getChatResponse } from '../services/api';
import { CHAT_STARTERS } from '../data/roadmapData';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const career = useMemo(() => {
    const saved = localStorage.getItem('lastAnalysis');
    if (saved) return JSON.parse(saved).predicted_career;
    return '';
  }, []);

  const confidence = useMemo(() => {
    const saved = localStorage.getItem('lastAnalysis');
    if (!saved) return '';
    const data = JSON.parse(saved);
    const score = data.confidence_scores?.[data.predicted_career];
    return score ? `${Math.round(score * 100)}%` : '';
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const context = `Predicted career: ${career} (${confidence} confidence). User is exploring next steps in Rwanda tech.`;
      const result = await getChatResponse(msg, career, context);
      const reply = result.data?.response || result.response || 'Sorry, I could not generate a response.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-140px)]">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">Career Assistant</h1>
          {career && (
            <p className="text-sm text-klenz-muted mt-1">
              Context: <span className="text-klenz-purple font-medium">{career}</span>
              {confidence && <span className="text-klenz-teal"> · {confidence} match</span>}
            </p>
          )}
        </div>

        <div className="flex-1 panel overflow-y-auto p-4 space-y-3 mb-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-klenz-muted text-sm mb-4">Try one of these questions:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {CHAT_STARTERS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-2 rounded-full border border-klenz-border text-klenz-muted hover:border-klenz-purple hover:text-klenz-purple transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-klenz-teal text-white rounded-br-sm'
                    : 'bg-klenz-purple/20 text-gray-200 border border-klenz-purple/30 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-klenz-purple/20 border border-klenz-purple/30 px-4 py-2.5 rounded-2xl text-sm text-klenz-muted">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">·</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>·</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>·</span>
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about skills, companies, portfolio..."
            className="input-dark flex-1 text-sm"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-purple px-5 disabled:opacity-50">
            Send
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
