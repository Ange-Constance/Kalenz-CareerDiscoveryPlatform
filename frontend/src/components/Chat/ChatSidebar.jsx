import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatAPI } from '../../services/api';

export default function ChatSidebar() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your Career Assistant. Upload your evidence and I'll help you discover your ideal tech career path.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  const getStep = () => {
    if (location.pathname.includes('upload')) return 'upload';
    if (location.pathname.includes('profile')) return 'profile';
    if (location.pathname.includes('careers')) return 'careers';
    if (location.pathname.includes('roadmap')) return 'roadmap';
    return 'dashboard';
  };

  useEffect(() => {
    chatAPI.getHistory().then(({ data }) => {
      if (data.length > 0) {
        setMessages(data.map((m) => ({ role: m.role, content: m.content })));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await chatAPI.sendMessage(userMessage, { step: getStep() });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-klenz-card">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-orange-gradient text-white rounded-br-sm'
                  : 'bg-klenz-elevated text-klenz-muted border border-klenz-border rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-klenz-elevated border border-klenz-border px-3.5 py-2 rounded-2xl text-xs text-klenz-muted">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-klenz-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 input-dark text-xs py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-gradient text-white px-3 py-2 rounded-xl text-sm hover:opacity-90 disabled:opacity-50"
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}
