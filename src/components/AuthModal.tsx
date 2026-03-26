import { useState } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/2b1be9fb-8e8b-4b69-b810-26e72c2e7cfb";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: Record<string, string> = { action: tab, email, password };
      if (tab === "register") body.username = username;

      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Произошла ошибка");
      } else {
        localStorage.setItem("planeta_token", data.token);
        localStorage.setItem("planeta_username", data.username);
        window.location.reload();
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,12,41,0.85)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 p-8 relative"
        style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.05))", border: "1px solid rgba(168,85,247,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: "linear-gradient(90deg, #a855f7, #ec4899)" }}
        />

        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
          <Icon name="X" size={20} />
        </button>

        <div className="mb-2">
          <p className="text-2xl font-black text-white mb-1">🪐 Планета</p>
          <p className="text-white/40 text-sm">Войдите или создайте аккаунт</p>
        </div>

        <div className="flex mb-8 mt-6 border-b border-white/10">
          <button
            onClick={() => setTab("login")}
            className={`pb-3 mr-6 text-sm uppercase tracking-wider transition-colors ${tab === "login" ? "text-white border-b-2 border-purple-400" : "text-white/40 hover:text-white"}`}
          >
            Войти
          </button>
          <button
            onClick={() => setTab("register")}
            className={`pb-3 text-sm uppercase tracking-wider transition-colors ${tab === "register" ? "text-white border-b-2 border-purple-400" : "text-white/40 hover:text-white"}`}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 text-sm outline-none text-white placeholder-white/30 transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)" }}
          />
          {tab === "register" && (
            <input
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="px-4 py-3 text-sm outline-none text-white placeholder-white/30 transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)" }}
            />
          )}
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3 text-sm outline-none text-white placeholder-white/30 transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)" }}
          />
          {error && <p className="text-pink-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="py-3 text-sm uppercase tracking-wider font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer mt-2"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
          >
            {loading ? "Загрузка..." : tab === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </form>
      </div>
    </div>
  );
}
