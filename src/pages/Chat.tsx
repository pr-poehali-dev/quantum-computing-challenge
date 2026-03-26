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

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = useCallback(async () => {
    const res = await fetch(CHAT_URL);
    const data = await res.json();
    if (data.messages) setMessages(data.messages);
  }, []);

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
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
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
    <div className="flex flex-col h-[100dvh] bg-neutral-50">
      <div className="flex items-center justify-between px-4 py-3 bg-black text-white shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-neutral-400 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <span className="font-bold uppercase tracking-widest text-sm">Планета</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-neutral-400 text-sm">{username}</span>
          <button onClick={handleLogout} className="text-neutral-400 hover:text-white transition-colors">
            <Icon name="LogOut" size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-neutral-400 text-sm text-center">
              Здесь пока тишина.<br />Напишите первое сообщение!
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.user_id === userId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} gap-1`}>
              {!isMe && (
                <span className="text-xs text-neutral-500 px-1">{msg.username}</span>
              )}
              <div
                className={`max-w-[80%] sm:max-w-[60%] px-4 py-2.5 text-sm leading-relaxed break-words ${
                  isMe
                    ? "bg-black text-white"
                    : "bg-white text-neutral-900 border border-neutral-200"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[11px] text-neutral-400 px-1">{formatTime(msg.created_at)}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-neutral-200 bg-white px-4 py-3">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написать сообщение..."
            rows={1}
            style={{ resize: "none" }}
            className="flex-1 border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-black transition-colors bg-transparent rounded-none min-h-[44px] max-h-[120px] overflow-y-auto"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="bg-black text-white p-2.5 hover:bg-neutral-800 transition-colors disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Icon name="Send" size={20} />
          </button>
        </div>
        <p className="text-center text-[11px] text-neutral-400 mt-2 hidden sm:block">Enter — отправить · Shift+Enter — перенос строки</p>
      </div>
    </div>
  );
}
