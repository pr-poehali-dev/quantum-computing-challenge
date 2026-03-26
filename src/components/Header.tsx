import { useState, useEffect } from "react";
import AuthModal from "@/components/AuthModal";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("planeta_username"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("planeta_token");
    localStorage.removeItem("planeta_username");
    window.location.reload();
  };

  return (
    <>
      <header className={`absolute top-0 left-0 right-0 z-10 p-6 ${className ?? ""}`}>
        <div className="flex justify-between items-center">
          <div className="text-white text-sm uppercase tracking-wide font-bold">Планета</div>
          <nav className="flex gap-8 items-center">
            <a href="#features" className="text-white hover:text-neutral-400 transition-colors duration-300 uppercase text-sm">
              Возможности
            </a>
            <a href="#pricing" className="text-white hover:text-neutral-400 transition-colors duration-300 uppercase text-sm">
              Тарифы
            </a>
            {username ? (
              <div className="flex items-center gap-4">
                <span className="text-white text-sm opacity-80">{username}</span>
                <button
                  onClick={handleLogout}
                  className="text-white border border-white px-4 py-1.5 text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-white border border-white px-4 py-1.5 text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer"
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
