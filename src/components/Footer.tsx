export default function Footer() {
  return (
    <div
      className="relative"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className="relative h-[calc(100vh+400px)] sm:h-[calc(100vh+600px)] -top-[100vh]">
        <div
          className="h-[400px] sm:h-[600px] sticky top-[calc(100vh-400px)] sm:top-[calc(100vh-600px)]"
          style={{ background: "linear-gradient(135deg, #0a0718, #0f0c29)" }}
        >
          <div className="py-8 px-6 h-full w-full flex flex-col justify-between border-t border-white/10">
            <div className="flex shrink-0 gap-12 sm:gap-20">
              <div className="flex flex-col gap-2">
                <h3 className="mb-2 uppercase text-white/30 text-xs tracking-widest">Планета</h3>
                <a href="#features" className="text-white/60 hover:text-white transition-colors text-sm">Возможности</a>
                <a href="#pricing" className="text-white/60 hover:text-white transition-colors text-sm">Тарифы</a>
                <a href="#contact" className="text-white/60 hover:text-white transition-colors text-sm">Контакты</a>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="mb-2 uppercase text-white/30 text-xs tracking-widest">Пользователям</h3>
                <a href="#register" className="text-white/60 hover:text-white transition-colors text-sm">Регистрация</a>
                <a href="#login" className="text-white/60 hover:text-white transition-colors text-sm">Войти</a>
                <a href="#privacy" className="text-white/60 hover:text-white transition-colors text-sm">Конфиденциальность</a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <h1
                className="font-black leading-none"
                style={{
                  fontSize: "clamp(4rem, 18vw, 14rem)",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(168,85,247,0.15) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ПЛАНЕТА
              </h1>
              <p className="text-white/30 text-sm shrink-0">{new Date().getFullYear()} Планета</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
