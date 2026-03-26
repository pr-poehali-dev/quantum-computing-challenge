import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const CHAT_URL = "https://functions.poehali.dev/b342b7fb-efa0-4017-979a-6d02d02bea8f";
const AUTH_URL = "https://functions.poehali.dev/2b1be9fb-8e8b-4b69-b810-26e72c2e7cfb";

interface Message {
  id: number;
  user_id: number;
  username: string;
  text: string;
  created_at: string;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

const ORIGINAL_TITLE = "Планета — чат";

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasNew, setHasNew] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const titleBlinkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastIdRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    document.title = ORIGINAL_TITLE;
    const onVisibility = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        setHasNew(false);
        if (titleBlinkRef.current) clearInterval(titleBlinkRef.current);
        document.title = ORIGINAL_TITLE;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const startBlink = useCallback(() => {
    if (titleBlinkRef.current) return;
    let on = true;
    titleBlinkRef.current = setInterval(() => {
      document.title = on ? "💬 Новое сообщение!" : ORIGINAL_TITLE;
      on = !on;
    }, 1000);
  }, []);

  const stopBlink = useCallback(() => {
    if (titleBlinkRef.current) {
      clearInterval(titleBlinkRef.current);
      titleBlinkRef.current = null;
    }
    document.title = ORIGINAL_TITLE;
  }, []);

  const loadMessages = useCallback(async () => {
    const res = await fetch(CHAT_URL);
    const data = await res.json();
    if (data.messages) {
      const msgs: Message[] = data.messages;
      setMessages(msgs);
      if (msgs.length > 0) {
        const latestId = msgs[msgs.length - 1].id;
        if (lastIdRef.current !== 0 && latestId > lastIdRef.current && isVisibleRef.current === false) {
          setHasNew(true);
          startBlink();
        }
        lastIdRef.current = latestId;
      }
    }
  }, [startBlink]);

  useEffect(() => {
    if (!hasNew) stopBlink();
  }, [hasNew, stopBlink]);

  useEffect(() => {
    const t = localStorage.getItem("planeta_token");
    const u = localStorage.getItem("planeta_username");
    if (!t || !u) {
      navigate("/");
      return;
    }
    setToken(t);
    setUsername(u);

    fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": t },
      body: JSON.stringify({ action: "me" }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.user_id) setUserId(d.user_id); })
      .catch(console.error);

    loadMessages();
    pollingRef.current = setInterval(loadMessages, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (titleBlinkRef.current) clearInterval(titleBlinkRef.current);
      document.title = "Планета — место для общения";
    };
  }, [navigate, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending || !token) return;
    setSending(true);
    const myText = text.trim();
    setText("");
    const res = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify({ text: myText }),
    });
    const msg = await res.json();
    if (res.ok && msg.id) {
      setMessages((prev) => [...prev, msg]);
      lastIdRef.current = msg.id;
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("planeta_token");
    localStorage.removeItem("planeta_username");
    navigate("/");
  };

  return (
    <div className="flex flex-col h-[100dvh]" style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-white/10" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-white/50 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <span className="font-bold uppercase tracking-widest text-sm text-white">🪐 Планета</span>
          {hasNew && (
            <span className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse font-medium">
              Новое!
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { const t = localStorage.getItem("planeta_token"); if (t) { try { const p = JSON.parse(atob(t.split(".")[1] + "==")); navigate(`/profile/${p.user_id}`); } catch (err) { console.error(err); } } }}
            className="text-white/50 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            <Icon name="User" size={16} />
            {username}
          </button>
          <button onClick={handleLogout} className="text-white/50 hover:text-white transition-colors">
            <Icon name="LogOut" size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/40 text-sm text-center">
              Здесь пока тишина.<br />Напишите первое сообщение! 🚀
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.user_id === userId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} gap-1`}>
              {!isMe && (
                <button
                  onClick={() => navigate(`/profile/${msg.user_id}`)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors px-1 cursor-pointer"
                >
                  {msg.username}
                </button>
              )}
              <div
                className={`max-w-[80%] sm:max-w-[60%] px-4 py-2.5 text-sm leading-relaxed break-words ${
                  isMe
                    ? "text-white"
                    : "text-white/90 border border-white/10"
                }`}
                style={isMe
                  ? { background: "linear-gradient(135deg, #a855f7, #ec4899)" }
                  : { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }
                }
              >
                {msg.text}
              </div>
              <span className="text-[11px] text-white/30 px-1">{formatTime(msg.created_at)}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-white/10" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написать сообщение..."
            rows={1}
            style={{ resize: "none", background: "rgba(255,255,255,0.08)" }}
            className="flex-1 border border-white/20 px-4 py-2.5 text-sm outline-none focus:border-purple-400 transition-colors text-white placeholder-white/30 rounded-none min-h-[44px] max-h-[120px] overflow-y-auto"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="text-white p-2.5 transition-all disabled:opacity-40 cursor-pointer shrink-0 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
          >
            <Icon name="Send" size={20} />
          </button>
        </div>
        <p className="text-center text-[11px] text-white/20 mt-2 hidden sm:block">Enter — отправить · Shift+Enter — перенос строки</p>
      </div>
    </div>
  );
}