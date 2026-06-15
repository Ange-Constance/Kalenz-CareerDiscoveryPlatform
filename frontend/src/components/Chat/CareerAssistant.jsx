import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { CHAT_STARTERS } from "../../data/roadmapData";
import { chatAPI, getChatResponse } from "../../services/api";

const WELCOME =
  "Hi! I'm your Career Assistant. Upload your evidence and I'll help you discover your ideal tech career path.";

export default function CareerAssistant({ variant = "dashboard" }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const location = useLocation();

  const career = useMemo(() => {
    const selected = localStorage.getItem("selectedCareer");
    if (selected) return selected;
    const saved = localStorage.getItem("lastAnalysis");
    if (saved) {
      try {
        return JSON.parse(saved).predicted_career || "";
      } catch {
        return "";
      }
    }
    const analysis = localStorage.getItem("latestAnalysis");
    if (analysis) {
      try {
        return JSON.parse(analysis).top_career || "";
      } catch {
        return "";
      }
    }
    return "";
  }, []);

  const confidence = useMemo(() => {
    const saved = localStorage.getItem("lastAnalysis");
    if (!saved) return "";
    try {
      const data = JSON.parse(saved);
      const score = data.confidence_scores?.[data.predicted_career];
      return score ? `${Math.round(score * 100)}%` : "";
    } catch {
      return "";
    }
  }, []);

  const getStep = () => {
    if (location.pathname.includes("upload")) return "upload";
    if (location.pathname.includes("profile")) return "profile";
    if (location.pathname.includes("careers")) return "careers";
    if (location.pathname.includes("roadmap")) return "roadmap";
    if (location.pathname.includes("chat")) return "chat";
    return "dashboard";
  };

  useEffect(() => {
    if (variant !== "dashboard") return;
    chatAPI
      .getHistory()
      .then(({ data }) => {
        if (data.length > 0) {
          setMessages(data.map((m) => ({ role: m.role, content: m.content })));
        }
      })
      .catch(() => {});
  }, [variant]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userMessage = text.trim();
    if (!userMessage || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      let reply;

      if (variant === "dashboard") {
        const { data } = await chatAPI.sendMessage(userMessage, {
          step: getStep(),
        });
        reply = data.response;
      } else {
        const context = career
          ? `Predicted career: ${career}${confidence ? ` (${confidence} confidence)` : ""}. User is exploring next steps in Rwanda tech.`
          : "User is exploring career paths in Rwanda tech.";
        const result = await getChatResponse(userMessage, career, context);
        reply =
          result.data?.response ||
          result.response ||
          "Sorry, I could not generate a response.";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble responding. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showStarters =
    messages.length === 1 && messages[0]?.role === "assistant";

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div className="mb-5 shrink-0">
        <h1 className="page-title">Career Assistant</h1>
        <p className="page-subtitle mt-1.5">
          {career ? (
            <>
              Context:{" "}
              <span className="text-klenz-orange font-medium">{career}</span>
              {confidence && (
                <span className="text-klenz-muted"> · {confidence} match</span>
              )}
            </>
          ) : (
            "Ask anything about skills, careers, and next steps in Rwanda tech."
          )}
        </p>
      </div>

      <div className="panel flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3">
          {showStarters && (
            <div className="text-center py-6">
              <p className="text-klenz-muted text-sm mb-4">
                Try one of these questions:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {CHAT_STARTERS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-2 rounded-full border border-klenz-border text-klenz-muted hover:border-klenz-orange hover:text-klenz-orange transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-panel text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-orange-gradient text-white rounded-br-sm"
                    : "bg-klenz-elevated text-klenz-muted border border-klenz-border rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-klenz-elevated border border-klenz-border px-4 py-2.5 rounded-panel text-sm text-klenz-muted">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">·</span>
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  >
                    ·
                  </span>
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  >
                    ·
                  </span>
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
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
              className="btn-orange px-5 disabled:opacity-50 shrink-0"
            >
              ↑
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
