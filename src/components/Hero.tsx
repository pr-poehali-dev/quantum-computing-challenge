import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const handleStart = () => {
    const token = localStorage.getItem("planeta_token");
    if (token) {
      navigate("/chat");
    } else {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url('https://cdn.poehali.dev/projects/78aa2217-ebc3-4db9-b531-b511fad2963a/files/01335c8d-17e7-4346-8151-412213d410d8.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(15,12,41,0.5) 0%, rgba(15,12,41,0.85) 100%)" }} />

      <motion.div
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #a855f7, transparent)" }}
      />
      <motion.div
        animate={{ y: [0, 20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #ec4899, transparent)" }}
      />

      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <p className="text-sm uppercase tracking-[0.3em] text-purple-300 mb-6 font-medium">Добро пожаловать на</p>
          <h1
            className="font-black mb-6 leading-none"
            style={{
              fontSize: "clamp(4rem, 15vw, 12rem)",
              background: "linear-gradient(135deg, #fff 30%, #c084fc 60%, #f472b6 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ПЛАНЕТА
          </h1>
          <p className="text-lg md:text-xl max-w-xl mx-auto text-white/70 mb-10 leading-relaxed">
            Место, где живые разговоры объединяют людей. Мгновенно, красиво, без лишнего шума.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStart}
              className="px-8 py-4 font-semibold text-sm uppercase tracking-wider text-white transition-all hover:scale-105 hover:shadow-2xl cursor-pointer"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
            >
              Начать общение
            </button>
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 font-semibold text-sm uppercase tracking-wider text-white border border-white/30 hover:border-white/60 transition-all hover:bg-white/10 cursor-pointer"
            >
              Узнать больше
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
