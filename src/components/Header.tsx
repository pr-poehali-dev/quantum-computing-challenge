import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setUsername(localStorage.getItem("planeta_username"));
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("planeta_token");
    localStorage.removeItem("planeta_username");
    window.location.reload();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-4 transition-all duration-300 ${className ?? ""}`}
        style={{
          background: scrolled ? "rgba(15,12,41,0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        }}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div
            className="font-black text-base uppercase tracking-widest cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              background: "linear-gradient(135deg, #fff, #c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            🪐 Планета
          </div>
          <nav className="flex gap-4 sm:gap-8 items-center">
            <a href="#features" className="text-white/60 hover:text-white transition-colors uppercase text-xs tracking-wider hidden sm:block">
              Возможности
            </a>
            <a href="#pricing" className="text-white/60 hover:text-white transition-colors uppercase text-xs tracking-wider hidden sm:block">
              Тарифы
            </a>
            {username ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/chat")}
                  className="px-4 py-2 text-white text-xs uppercase tracking-wider font-semibold transition-all hover:opacity-90 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
                >
                  Чат
                </button>
                <button
                  onClick={handleLogout}
                  className="text-white/50 hover:text-white transition-colors text-xs uppercase tracking-wider cursor-pointer"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 py-2 text-white text-xs uppercase tracking-wider font-semibold border border-white/30 hover:border-purple-400 hover:bg-purple-400/10 transition-all cursor-pointer"
              >
                Войти
              </button>
            )}
          </nav>
        </div>
      </header>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
