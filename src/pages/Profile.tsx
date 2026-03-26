import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";

const PROFILE_URL = "https://functions.poehali.dev/424e20cb-9507-4f1d-a042-10ffa9691407";

interface UserProfile {
  id: number;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

function Avatar({ url, username, size = 80 }: { url: string | null; username: string; size?: number }) {
  const color = `hsl(${(username.charCodeAt(0) * 37) % 360}, 60%, 50%)`;
  return url ? (
    <img
      src={url}
      alt={username}
      style={{ width: size, height: size, objectFit: "cover", borderRadius: "50%", border: "2px solid rgba(168,85,247,0.4)" }}
    />
  ) : (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}, #a855f7)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.4, fontWeight: 700, color: "#fff",
        border: "2px solid rgba(168,85,247,0.4)",
      }}
    >
      {username[0]?.toUpperCase()}
    </div>
  );
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMe, setIsMe] = useState(false);
  const [myId, setMyId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("planeta_token");
    const storedUsername = localStorage.getItem("planeta_username");
    if (!token || !storedUsername) {
      navigate("/");
      return;
    }

    // Определяем свой ID из токена
    try {
      const payload = JSON.parse(atob(token.split(".")[1] + "=="));
      setMyId(payload.user_id);
      if (String(payload.user_id) === String(userId)) setIsMe(true);
    } catch {
      // ignore
    }

    fetch(`${PROFILE_URL}?user_id=${userId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.id) {
          setProfile(d);
          setBio(d.bio || "");
          setUsername(d.username || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId, navigate]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("planeta_token");
    const res = await fetch(PROFILE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token || "" },
      body: JSON.stringify({ action: "update_bio", bio, username }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Ошибка");
    } else {
      localStorage.setItem("planeta_username", username);
      setProfile((p) => p ? { ...p, bio, username } : p);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const token = localStorage.getItem("planeta_token");
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token || "" },
        body: JSON.stringify({ action: "upload_avatar", image: b64, content_type: file.type }),
      });
      const data = await res.json();
      if (data.avatar_url) setProfile((p) => p ? { ...p, avatar_url: data.avatar_url } : p);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100dvh]" style={{ background: "linear-gradient(135deg, #0f0c29, #302b63)" }}>
        <div className="text-white/40 text-sm">Загрузка...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] gap-4" style={{ background: "linear-gradient(135deg, #0f0c29, #302b63)" }}>
        <p className="text-white/40">Пользователь не найден</p>
        <button onClick={() => navigate("/chat")} className="text-purple-400 hover:text-purple-300 text-sm">← Вернуться в чат</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh]" style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-white/10" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
        <button onClick={() => navigate("/chat")} className="text-white/50 hover:text-white transition-colors flex items-center gap-2">
          <Icon name="ArrowLeft" size={20} />
          <span className="text-sm">Чат</span>
        </button>
        <span className="text-white font-bold text-sm uppercase tracking-widest">Профиль</span>
        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-6 py-10">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <Avatar url={profile.avatar_url} username={profile.username} size={100} />
              {isMe && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                    style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
                  >
                    <Icon name="Camera" size={14} />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div
            className="p-6 mb-4"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {editing ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-widest mb-1 block">Имя</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(168,85,247,0.4)" }}
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-widest mb-1 block">О себе</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={300}
                    style={{ resize: "none", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(168,85,247,0.4)" }}
                    className="w-full px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
                {error && <p className="text-pink-400 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2 text-sm uppercase tracking-wider text-white font-semibold disabled:opacity-50 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
                  >
                    {saving ? "Сохранение..." : "Сохранить"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-sm text-white/50 hover:text-white border border-white/20 cursor-pointer"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-white font-bold text-xl">{profile.username}</h2>
                  {isMe && (
                    <button onClick={() => setEditing(true)} className="text-white/40 hover:text-purple-400 transition-colors">
                      <Icon name="Pencil" size={16} />
                    </button>
                  )}
                </div>
                <p className="text-white/30 text-xs mb-4">
                  На Планете с {new Date(profile.created_at).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
                </p>
                {profile.bio ? (
                  <p className="text-white/70 text-sm leading-relaxed">{profile.bio}</p>
                ) : (
                  <p className="text-white/20 text-sm italic">
                    {isMe ? "Расскажите о себе — нажмите карандаш ✏️" : "Пользователь ещё ничего не написал"}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Message button (for others' profiles) */}
          {!isMe && myId && (
            <button
              onClick={() => navigate(`/dm/${profile.id}`)}
              className="w-full py-3 text-sm uppercase tracking-wider font-semibold text-white transition-all hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
            >
              <Icon name="MessageCircle" size={18} />
              Написать сообщение
            </button>
          )}

          {isMe && (
            <button
              onClick={() => navigate("/chat")}
              className="w-full py-3 text-sm uppercase tracking-wider font-semibold text-white/60 hover:text-white border border-white/20 hover:border-white/40 transition-all cursor-pointer"
            >
              Перейти в общий чат
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
