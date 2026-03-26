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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md mx-4 p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors">
          <Icon name="X" size={20} />
        </button>

        <div className="flex mb-8 border-b border-neutral-200">
          <button
            onClick={() => setTab("login")}
            className={`pb-3 mr-6 text-sm uppercase tracking-wide transition-colors ${tab === "login" ? "border-b-2 border-black text-black" : "text-neutral-400 hover:text-black"}`}
          >
            Войти
          </button>
          <button
            onClick={() => setTab("register")}
            className={`pb-3 text-sm uppercase tracking-wide transition-colors ${tab === "register" ? "border-b-2 border-black text-black" : "text-neutral-400 hover:text-black"}`}
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
            className="border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
          />
          {tab === "register" && (
            <input
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            />
          )}
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-3 text-sm uppercase tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? "Загрузка..." : tab === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </form>
      </div>
    </div>
  );
}
