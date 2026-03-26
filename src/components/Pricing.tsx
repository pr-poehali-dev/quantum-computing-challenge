import { motion } from "framer-motion";
import Icon from "@/components/ui/icon";

const plans = [
  {
    name: "Бесплатно",
    price: "0 ₽",
    period: "навсегда",
    description: "Для личного общения",
    features: ["До 10 чатов", "Личные сообщения", "Файлы до 50 МБ", "Мобильное приложение"],
    cta: "Начать бесплатно",
    highlighted: false,
  },
  {
    name: "Про",
    price: "299 ₽",
    period: "в месяц",
    description: "Для активных пользователей",
    features: ["Неограниченные чаты", "Группы до 500 чел.", "Файлы до 2 ГБ", "Голосовые и видеозвонки", "Приоритетная поддержка"],
    cta: "Выбрать Про",
    highlighted: true,
  },
  {
    name: "Команда",
    price: "999 ₽",
    period: "в месяц",
    description: "Для бизнеса и команд",
    features: ["Всё из Про", "Группы до 5000 чел.", "Администрирование", "Аналитика", "API доступ", "SLA 24/7"],
    cta: "Связаться с нами",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div
      id="pricing"
      className="px-6 py-20 lg:py-32"
      style={{ background: "linear-gradient(180deg, #1a1040 0%, #0f0c29 100%)" }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-4 font-medium">Тарифы</p>
          <h2
            className="font-black text-4xl lg:text-6xl leading-tight mb-4"
            style={{
              background: "linear-gradient(135deg, #fff 40%, #c084fc 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Выберите свой план
          </h2>
          <p className="text-white/50 text-lg max-w-xl">
            Начните бесплатно — платите только когда нужно больше.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col p-8 relative"
              style={{
                background: plan.highlighted
                  ? "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))"
                  : "rgba(255,255,255,0.05)",
                border: `1px solid ${plan.highlighted ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.1)"}`,
              }}
            >
              {plan.highlighted && (
                <div
                  className="absolute -top-px left-0 right-0 h-0.5"
                  style={{ background: "linear-gradient(90deg, #a855f7, #ec4899)" }}
                />
              )}
              {plan.highlighted && (
                <span
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white px-3 py-1 font-bold whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
                >
                  Популярный
                </span>
              )}

              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest text-white/40 mb-3">{plan.name}</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-white/40 text-sm mb-1">{plan.period}</span>
                </div>
                <p className="text-white/40 text-sm">{plan.description}</p>
              </div>

              <ul className="flex flex-col gap-3 mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                    <Icon name="Check" size={15} className="text-purple-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className="py-3 text-sm uppercase tracking-wider font-semibold transition-all cursor-pointer hover:opacity-90"
                style={plan.highlighted
                  ? { background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "#fff" }
                  : { background: "transparent", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.2)" }
                }
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
