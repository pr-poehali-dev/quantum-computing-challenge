import { motion } from "framer-motion";
import Icon from "@/components/ui/icon";

const features = [
  { icon: "MessageCircle", title: "Личные чаты", desc: "Приватное общение один на один — быстро и безопасно." },
  { icon: "Users", title: "Группы", desc: "Создавайте сообщества по интересам до 5000 участников." },
  { icon: "Zap", title: "Мгновенно", desc: "Сообщения доставляются в реальном времени без задержек." },
  { icon: "Shield", title: "Приватность", desc: "Ваши данные защищены и не передаются третьим лицам." },
  { icon: "Paperclip", title: "Файлы", desc: "Делитесь фото, видео и документами прямо в чате." },
  { icon: "Smartphone", title: "Везде", desc: "Работает на ПК, iOS и Android — всегда под рукой." },
];

export default function Featured() {
  return (
    <div
      id="features"
      className="px-6 py-20 lg:py-32"
      style={{ background: "linear-gradient(180deg, #0f0c29 0%, #1a1040 100%)" }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-4 font-medium">Возможности</p>
          <h2
            className="font-black text-4xl lg:text-6xl leading-tight mb-6"
            style={{
              background: "linear-gradient(135deg, #fff 40%, #c084fc 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Общение без барьеров
          </h2>
          <p className="text-white/50 text-lg max-w-xl">
            Всё что нужно для живого общения — в одном месте.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "rgba(255,255,255,0.06)" }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="p-8 group hover:bg-white/5 transition-colors"
              style={{ background: "linear-gradient(135deg, #0f0c29, #1a1040)" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))", border: "1px solid rgba(168,85,247,0.3)" }}
              >
                <Icon name={f.icon as "MessageCircle"} size={22} className="text-purple-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
