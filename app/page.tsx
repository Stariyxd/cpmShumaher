'use client';

import { useState, useEffect } from 'react';

interface Ad {
  id: string;
  title: string;
  category: 'sell' | 'buy' | 'exchange';
  price: string;
  specs?: string;
  description: string;
  gameId: string;
  contact: string;
}

export default function Home() {
  const [telegramUser, setTelegramUser] = useState<{ id: number; username?: string } | null>(null);
  const [gameId, setGameId] = useState<string | null>('7841923'); // Пока для теста зашито, чтобы сразу видеть витрину
  const [activeTab, setActiveTab] = useState<'sell' | 'buy' | 'exchange'>('sell');

  // Тестовые данные под твою концепцию с характеристиками (hp/nm)
  const [ads] = useState<Ad[]>([
    {
      id: '1',
      title: 'BMW M5 F90',
      category: 'sell',
      price: '15,000,000 с.',
      specs: '1200hp (1200) / 1400nm (1400)',
      description: 'Фулл тюнинг, эксклюзивный винил, идеальное состояние.',
      gameId: '459102',
      contact: '@shumaher_cpm',
    },
    {
      id: '2',
      title: 'Ищу заряженный дрифт-кар',
      category: 'buy',
      price: 'Бюджет: 20,000,000 с.',
      specs: '900hp+ / Дрифт настройка',
      description: 'Куплю готовую машину подваливать боком.',
      gameId: '883192',
      contact: '@buyer_test',
    },
    {
      id: '3',
      title: 'Mercedes E63 AMG на обмен',
      category: 'exchange',
      price: 'Обмен на внедорожник',
      specs: '1000hp (1000)',
      description: 'Меняю заряженную эшку на Гелик с вашей или моей доплатой.',
      gameId: '7841923',
      contact: '@shumaher_cpm',
    }
  ]);

  const filteredAds = ads.filter(ad => ad.category === activeTab);

  return (
    <main className="min-h-screen bg-gray-950 text-white font-sans pb-24 p-4">
      {/* Шапка профиля */}
      <div className="max-w-md mx-auto space-y-4">
        <header className="flex justify-between items-center bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Игровой профиль</span>
            <span className="font-mono font-bold text-yellow-400 text-sm">ID: {gameId}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Telegram</span>
            <span className="text-xs font-bold text-gray-200">@{telegramUser?.username || 'user'}</span>
          </div>
        </header>

        {/* Переключатель вкладок маркетплейса */}
        <div className="flex bg-gray-900 p-1.5 rounded-2xl border border-gray-800 shadow-md">
          <button 
            onClick={() => setActiveTab('sell')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${activeTab === 'sell' ? 'bg-yellow-500 text-gray-950 shadow' : 'text-gray-400 hover:text-white'}`}
          >
            💰 Продажа
          </button>
          <button 
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${activeTab === 'buy' ? 'bg-yellow-500 text-gray-950 shadow' : 'text-gray-400 hover:text-white'}`}
          >
            🛒 Покупка
          </button>
          <button 
            onClick={() => setActiveTab('exchange')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${activeTab === 'exchange' ? 'bg-yellow-500 text-gray-950 shadow' : 'text-gray-400 hover:text-white'}`}
          >
            🔄 Обмен
          </button>
        </div>

        {/* Лента объявлений */}
        <div className="space-y-3">
          {filteredAds.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs bg-gray-900/50 border border-gray-800/80 rounded-2xl">
              В этом разделе пока нет активных объявлений.
            </div>
          ) : (
            filteredAds.map((ad) => (
              <div key={ad.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-md space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-white">{ad.title}</h3>
                    {ad.specs && (
                      <span className="inline-block bg-gray-950 border border-gray-800 text-yellow-400 font-mono text-[10px] px-2 py-0.5 rounded-md mt-1">
                        ⚙️ {ad.specs}
                      </span>
                    )}
                  </div>
                  <span className="text-yellow-400 font-extrabold text-sm">{ad.price}</span>
                </div>

                <p className="text-gray-300 text-xs leading-relaxed">{ad.description}</p>

                <div className="pt-3 flex justify-between items-center border-t border-gray-800 text-xs">
                  <span className="text-gray-500 font-mono text-[10px]">Game ID: {ad.gameId}</span>
                  <button 
                    onClick={() => alert(`Отклик отправлен автору лота (${ad.contact})!`)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-gray-950 px-3.5 py-1.5 rounded-xl font-bold transition shadow"
                  >
                    {activeTab === 'sell' ? 'Купить / Спросить' : activeTab === 'buy' ? 'Предложить авто' : 'Предложить обмен'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}