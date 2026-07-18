export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-6 font-sans">
      {/* Главный заголовок */}
      <header className="text-center my-12">
        <h1 className="text-3xl font-bold mb-2">CPM Shumaher Hub</h1>
        <p className="text-gray-400">Информационный дашборд: Car Parking & Landmand Simulator</p>
      </header>

      {/* Ссылки */}
      <section className="max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-300 uppercase tracking-wider text-sm">Ссылки</h2>
        <div className="flex flex-col gap-3">
          <a href="https://t.me/shumahercpm" className="block w-full py-4 px-6 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-lg transition-all text-center font-medium">
            Мой Telegram-канал
          </a>
          <a href="https://tiktok.com/@shumahercpm" className="block w-full py-4 px-6 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-lg transition-all text-center font-medium">
            TikTok
          </a>
        </div>
      </section>

      {/* Блок новостей */}
      <section className="max-w-md mx-auto mt-12">
        <h2 className="text-lg font-semibold mb-4 text-gray-300 uppercase tracking-wider text-sm">Новости проектов</h2>
        <div className="border border-[#333] bg-[#1a1a1a] p-6 rounded-lg">
          <h3 className="font-bold mb-2 text-white">Новости от Адиля Тасимова</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Актуальная информация по проектам студии Olzhass Games будет здесь.
          </p>
        </div>
      </section>

      <footer className="mt-20 text-center text-xs text-gray-600">
        <p>Личный проект. Не является официальным ресурсом разработчиков.</p>
      </footer>
    </main>
  );
}