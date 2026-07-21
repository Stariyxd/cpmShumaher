'use client';

import { useState } from 'react';

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
  const [telegramUser, setTelegramUser] = useState<{ id: number; username?: string } | null>({ id: 12345678, username: 'shumaher_cpm' });
  const [gameId] = useState<string>('7841923'); // Привязанный Game ID пользователя
  const [activeTab, setActiveTab] = useState<'sell' | 'buy' | 'exchange'>('sell');
  const [showModal, setShowModal] = useState(false);

  // Список объявлений (пока в памяти, позже подключим Supabase)
  const [ads, setAds] = useState<Ad[]>([
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
    }
  ]);

  // Состояния для формы создания нового объявления
  const [formCategory, setFormCategory] = useState<'sell' | 'buy' | 'exchange'>('sell');
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState<File | null>(null);

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAd: Ad = {
      id: Date.now().toString(),
      title: formTitle,
      category: formCategory,
      price: formPrice,
      specs: formSpecs || 'Стандарт',
      description: formDesc,
      gameId: gameId, // Автоподстановка привязанного Game ID
      contact: telegramUser?.username ? `@${telegramUser.username}` : 'ID: ' + telegramUser?.id,
    };

    setAds([newAd, ...ads]);
    setShowModal(false);

    // Сброс формы
    setFormTitle('');
    setFormPrice('');
    setFormSpecs('');
    setFormDesc('');
    setFormImage(null);

    alert('Объявление успешно создано и отправлено на модерацию администратору!');
  };

  const filteredAds = ads.filter(ad => ad.category === activeTab);

  return (
    <main className="min-h-screen bg-gray-950 text-white font-sans pb-24 p-4">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Шапка профиля и кнопка подачи */}
        <header className="flex justify-between items-center bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Игровой профиль</span>
            <span className="font-mono font-bold text-yellow-400 text-sm">ID: {gameId}</span>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold px-3 py-2 rounded-xl text-xs transition shadow"
          >
            + Подать объявление
          </button>
        </header>

        {/* Переключатель вкладок */}
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
              В этом разделе пока нет объявлений.
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

      {/* Модальное окно создания объявления */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md p-5 rounded-3xl space-y-4 shadow-2xl my-auto">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-base text-yellow-400">Новое объявление</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white font-bold text-sm">✕</button>
            </div>
            
            <form onSubmit={handleCreateAd} className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-medium">Тип объявления</label>
                <select 
                  value={formCategory} 
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="sell">Продажа (Sell)</option>
                  <option value="buy">Покупка (Buy)</option>
                  <option value="exchange">Обмен (Exchange)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-medium">Название авто / товара</label>
                <input 
                  type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Например: BMW M5 F90"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-medium">Мощность / Настройка (опционально)</label>
                <input 
                  type="text" value={formSpecs} onChange={(e) => setFormSpecs(e.target.value)}
                  placeholder="1234hp (1234) / 1234nm (1234)"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-medium">Цена или бюджет (в игре)</label>
                <input 
                  type="text" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="Например: 15,000,000 с."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-medium">Описание</label>
                <textarea 
                  required value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Опишите состояние, винил, особенности..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-medium">Скриншот внешнего вида / характеристик</label>
                <input 
                  type="file" accept="image/*"
                  onChange={(e) => e.target.files && setFormImage(e.target.files[0])}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-[10px] text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-500 file:text-gray-950 hover:file:bg-yellow-400"
                />
              </div>

              <div className="bg-gray-950 border border-gray-800 p-2.5 rounded-xl flex justify-between items-center text-[11px] text-gray-400 font-mono">
                <span>Game ID (автоподстановка):</span>
                <span className="text-yellow-400 font-bold">{gameId}</span>
              </div>

              <button 
                type="submit" 
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold py-3 rounded-xl text-xs transition shadow-lg mt-2"
              >
                Отправить на модерацию
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}