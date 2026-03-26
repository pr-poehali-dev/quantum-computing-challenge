import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Promo() {
  const navigate = useNavigate();

  const handleJoin = () => {
    const token = localStorage.getItem("planeta_token");
    if (token) navigate("/chat");
    else document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="relative px-6 py-24 lg:py-40 overflow-hidden flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #1a1040, #2d1b69, #1a1040)" }}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full border border-purple-500/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full border border-pink-500/10"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="text-sm uppercase tracking-[0.3em] text-pink-400 mb-6 font-medium">Присоединяйся</p>
          <h2
            className="font-black leading-tight mb-6"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 6rem)",
              background: "linear-gradient(135deg, #fff 20%, #c084fc 50%, #f472b6 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Твоя орбита — твои правила
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">
            Каждый разговор — это новая связь. Найди тех, кто думает как ты,
            и создай своё пространство для общения.
          </p>
          <button
            onClick={handleJoin}
            className="px-10 py-4 font-bold text-white text-sm uppercase tracking-wider transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] cursor-pointer"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
          >
            🚀 Начать прямо сейчас
          </button>
        </motion.div>
      </div>
    </div>
  );
}
