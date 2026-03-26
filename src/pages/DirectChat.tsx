import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";

const DIRECT_URL = "https://functions.poehali.dev/1fb7897c-5fff-4432-8932-5be62a6e05c0";
const PROFILE_URL = "https://functions.poehali.dev/424e20cb-9507-4f1d-a042-10ffa9691407";

interface Message {
  id: number;
  from_user_id: number;
  username: string;
  text: string;
  created_at: string;
}

interface UserProfile {
  id: number;
  username: string;
  avatar_url: string | null;
}

function Avatar({ url, username, size = 32 }: { url: string | null; username: string; size?: number }) {
  const color = `hsl(${(username.charCodeAt(0) * 37) % 360}, 60%, 50%)`;
  return url ? (
    <img src={url} alt={username} style={{ width: size, height: size, objectFit: "cover", borderRadius: "50%" }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}, #a855f7)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.45, fontWeight: 700, color: "#fff",
    }}>
      {username[0]?.toUpperCase()}
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

const ORIGINAL_TITLE = "Планета — личный чат";

export default function DirectChat() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [myId, setMyId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [hasNew, setHasNew] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const titleBlinkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastIdRef = useRef<number>(0);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    document.title = ORIGINAL_TITLE;
    const onVis = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        setHasNew(false);
        if (titleBlinkRef.current) clearInterval(titleBlinkRef.current);
        document.title = ORIGINAL_TITLE;
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const loadMessages = useCallback(async (t: string) => {
    const res = await fetch(`${DIRECT_URL}?with=${userId}`, {
      headers: { "X-Auth-Token": t },
    });
    const data = await res.json();
    if (data.messages) {
      setMessages(data.messages);
      const msgs: Message[] = data.messages;
      if (msgs.length > 0) {
        const latestId = msgs[msgs.length - 1].id;
        if (lastIdRef.current !== 0 && latestId > lastIdRef.current && !isVisibleRef.current) {
          setHasNew(true);
          if (!titleBlinkRef.current) {
            let on = true;
            titleBlinkRef.current = setInterval(() => {
              document.title = on ? "💬 Новое!" : ORIGINAL_TITLE;
              on = !on;
            }, 1000);
          }
        }
        lastIdRef.current = latestId;
      }
    }
  }, [userId]);

  useEffect(() => {
    const t = localStorage.getItem("planeta_token");
    if (!t) { navigate("/"); return; }
    setToken(t);
    try {
      const payload = JSON.parse(atob(t.split(".")[1] + "=="));
      setMyId(payload.user_id);
    } catch { navigate("/"); return; }

    fetch(`${PROFILE_URL}?user_id=${userId}`)
      .then((r) => r.json())
      .then((d) => { if (d.id) setPartner(d); })
      .catch(console.error);

    loadMessages(t);
    pollingRef.current = setInterval(() => loadMessages(t), 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (titleBlinkRef.current) clearInterval(titleBlinkRef.current);
      document.title = "Планета — место для общения";
    };
  }, [userId, navigate, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending || !token) return;
    setSending(true);
    const myText = text.trim();
    setText("");
    const res = await fetch(DIRECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify({ to_user_id: Number(userId), text: myText }),
    });
    const msg = await res.json();
    if (res.ok && msg.id) {
      setMessages((prev) => [...prev, { ...msg, username: localStorage.getItem("planeta_username") || "" }]);
      lastIdRef.current = msg.id;
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-[100dvh]" style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-white/10" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
        <button onClick={() => navigate("/chat")} className="text-white/50 hover:text-white transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>

        {partner ? (
          <button
            onClick={() => navigate(`/profile/${partner.id}`)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar url={partner.avatar_url} username={partner.username} size={32} />
            <div className="text-left">
              <p className="text-white font-semibold text-sm leading-tight">{partner.username}</p>
              <p className="text-white/40 text-xs">нажмите для профиля</p>
            </div>
          </button>
        ) : (
          <span className="text-white/40 text-sm">Загрузка...</span>
        )}

        <div className="flex items-center gap-2">
          {hasNew && <span className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse font-medium">Новое!</span>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/30 text-sm text-center">
              Начните разговор с {partner?.username || "пользователем"} 💬
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.from_user_id === myId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} gap-1`}>
              <div
                className={`max-w-[80%] sm:max-w-[60%] px-4 py-2.5 text-sm leading-relaxed break-words`}
                style={isMe
                  ? { background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }
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
            placeholder={`Написать ${partner?.username || ""}...`}
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
      </div>
    </div>
  );
}
