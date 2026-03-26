import Icon from "@/components/ui/icon";

const plans = [
  {
    name: "Бесплатно",
    price: "0 ₽",
    period: "навсегда",
    description: "Для личного общения",
    features: [
      "До 10 чатов",
      "Личные сообщения",
      "Обмен файлами до 50 МБ",
      "Мобильное приложение",
    ],
    cta: "Начать бесплатно",
    highlighted: false,
  },
  {
    name: "Про",
    price: "299 ₽",
    period: "в месяц",
    description: "Для активных пользователей",
    features: [
      "Неограниченные чаты",
      "Групповые беседы до 500 чел.",
      "Файлы до 2 ГБ",
      "Голосовые и видеозвонки",
      "Приоритетная поддержка",
    ],
    cta: "Выбрать Про",
    highlighted: true,
  },
  {
    name: "Команда",
    price: "999 ₽",
    period: "в месяц",
    description: "Для бизнеса и команд",
    features: [
      "Всё из Про",
      "Групповые беседы до 5000 чел.",
      "Администрирование",
      "Аналитика и статистика",
      "API доступ",
      "SLA поддержка 24/7",
    ],
    cta: "Связаться с нами",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="bg-white px-6 py-20 lg:py-32">
      <div className="max-w-6xl mx-auto">
        <h3 className="uppercase text-sm tracking-wide text-neutral-600 mb-4">Тарифы</h3>
        <h2 className="text-4xl lg:text-6xl font-bold text-neutral-900 mb-4 leading-tight">
          Выберите свой план
        </h2>
        <p className="text-neutral-500 text-lg mb-16 max-w-xl">
          Начните бесплатно — платите только тогда, когда нужно больше возможностей.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-neutral-200">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`p-8 flex flex-col ${plan.highlighted ? "bg-black text-white" : "bg-white text-neutral-900"} ${i < plans.length - 1 ? "border-b md:border-b-0 md:border-r border-neutral-200" : ""}`}
            >
              <div className="mb-8">
                <p className={`text-xs uppercase tracking-widest mb-3 ${plan.highlighted ? "text-neutral-400" : "text-neutral-500"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.highlighted ? "text-neutral-400" : "text-neutral-500"}`}>{plan.period}</span>
                </div>
                <p className={`text-sm ${plan.highlighted ? "text-neutral-400" : "text-neutral-500"}`}>{plan.description}</p>
              </div>

              <ul className="flex flex-col gap-3 mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Icon name="Check" size={16} className={plan.highlighted ? "text-white" : "text-black"} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`py-3 text-sm uppercase tracking-wide transition-colors cursor-pointer border ${
                  plan.highlighted
                    ? "bg-white text-black border-white hover:bg-neutral-200"
                    : "bg-transparent text-black border-black hover:bg-black hover:text-white"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
