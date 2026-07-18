export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans flex flex-col items-center">
      
      {/* Логотип/Заголовок с неоновым акцентом */}
      <header className="text-center my-16">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          CPM SHUMAHER HUB
        </h1>
        <p className="text-gray-500 tracking-widest uppercase text-sm">Official Dashboard & Updates</p>
      </header>

      {/* Ссылки как кнопки с неоновой обводкой */}
      <section className="w-full max-w-sm space-y-4">
        <LinkButton href="https://t.me/shumahercpm" text="TELEGRAM CHANNEL" />
        <LinkButton href="https://tiktok.com/@shumahercpm" text="TIKTOK" />
      </section>

      {/* Блок новостей — теперь выделяется */}
      <section className="w-full max-w-lg mt-16 p-[1px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
        <div className="bg-[#121212] p-6 rounded-[11px]">
          <h3 className="font-bold mb-3 text-blue-400">NEWS FROM ADIL TASSIMOV</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Актуальная информация по проектам студии Olzhass Games будет здесь. 
            Следите за обновлениями, чтобы не пропустить важные изменения физики.
          </p>
        </div>
      </section>

      <footer className="mt-20 text-[10px] text-gray-700 uppercase tracking-widest">
        Community Project • Not Affiliated with Developers
      </footer>
    </main>
  );
}

function LinkButton({ href, text }: { href: string; text: string }) {
  return (
    <a 
      href={href} 
      className="block w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-center font-bold tracking-wider text-sm transition-all hover:border-blue-500/50 hover:text-blue-400"
    >
      {text}
    </a>
  );
}