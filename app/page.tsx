'use client';

import { useState } from 'react';

// Временный тип для объявления
interface Ad {
  id: string;
  title: string;
  category: 'sell' | 'buy' | 'exchange';
  price: string;
  description: string;
  contact: string;
  status: 'approved' | 'pending';
}

export default function TradeMarket() {
  const [activeTab, setActiveTab] = useState<'sell' | 'buy' | 'exchange'>('sell');
  const [showModal, setShowModal] = useState(false);

  // Тестовые данные для примера (позже сюда подключим базу данных)
  const [ads, setAds] = useState<Ad[]>([
    {
      id: '1',
      title: 'Mercedes-Benz E63 AMG',
      category: 'sell',
      price: '15,000,000 с.',
      description: 'Фулл тюнинг, винил, номера три семерки.',
      contact: '@shumaher_cpm',
      status: 'approved',
    },
    {
      id: '2',
      title: 'Ищу эксклюзивный винил',
      category: 'buy',
      price: 'Договорная',
      description: 'Куплю редкий дизайн на гелик.',
      contact: '@buyer_test',
      status: 'approved',
    }
  ]);

  // Состояние формы нового объявления
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newCategory, setNewCategory] = useState<'sell' | 'buy' | 'exchange'>('sell');

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    const ad: Ad = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      price: newPrice,
      description: newDesc,
      contact: newContact,
      status: 'pending', // Уходит на модерацию к тебе!
    };
    setAds([ad, ...ads]);
    setShowModal(false);
    // Очистка формы
    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
    setNewContact('');
    alert('Объявление отправлено на модерацию администратору!');
  };

  const filteredAds = ads.filter(ad => ad.category === activeTab && ad.status === 'approved');

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-24 font-sans">
      {/* Шапка */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <span className="font-bold tracking-wider text-yellow-400">CPM TRADE HUB</span>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold px-3 py-1.5 rounded-xl text-xs transition"
          >
            + Подать объявление
          </button>
        </div>
      </header>

      {/* Вкладки: Продажа / Покупка / Обмен */}
      <div className="max-w-md mx-auto px-4 mt-4">
        <div className="flex bg-gray-800 p-1 rounded-2xl border border-gray-700">
          <button 
            onClick={() => setActiveTab('sell')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'sell' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}
          >
            Продажа
          </button>
          <button 
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'buy' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}
          >
            Покупка
          </button>
          <button 
            onClick={() => setActiveTab('exchange')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'exchange' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}
          >
            Обмен
          </button>
        </div>
      </div>

      {/* Лента объявлений */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {filteredAds.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            В этом разделе пока нет одобренных объявлений.
          </div>
        ) : (
          filteredAds.map((ad) => (
            <div key={ad.id} className="bg-gray-800 border border-gray-700 p-4 rounded-2xl shadow-md space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-base text-white">{ad.title}</h3>
                <span className="text-yellow-400 font-extrabold text-sm">{ad.price}</span>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">{ad.description}</p>
              <div className="pt-2 flex justify-between items-center border-t border-gray-700/50 text-xs">
                <span className="text-gray-400">Связь: <strong className="text-white">{ad.contact}</strong></span>
                <a 
                  href={`https://t.me/${ad.contact.replace('@', '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg font-medium"
                >
                  Написать
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно создания объявления */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-md p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg text-white">Новое объявление</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            
            <form onSubmit={handleCreateAd} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Тип сделки</label>
                <select 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="sell">Продажа</option>
                  <option value="buy">Покупка</option>
                  <option value="exchange">Обмен</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Название (авто, деталь, услуга)</label>
                <input 
                  type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Например: BMW M5 F90"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Цена / Условия</label>
                <input 
                  type="text" required value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Например: 15,000,000 с."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Описание</label>
                <textarea 
                  required value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Опишите состояние, тюнинг..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Ваш Telegram (для связи)</label>
                <input 
                  type="text" required value={newContact} onChange={(e) => setNewContact(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold py-3 rounded-xl text-xs transition mt-2"
              >
                Опубликовать на проверку
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}