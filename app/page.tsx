'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';

interface Ad {
  id: string;
  title: string;
  category: 'sell' | 'buy' | 'exchange';
  price: string;
  specs?: string;
  description: string;
  gameId: string;
  contact: string;
  status: 'pending' | 'active' | 'rejected';
}

export default function Home() {
  const [telegramUser] = useState<{ id: number; username?: string }>({ id: 12345678, username: 'shumaher_cpm' });
  const [gameId] = useState<string>('7841923');
  const [currentView, setCurrentView] = useState<'marketplace' | 'admin'>('marketplace');
  const [activeTab, setActiveTab] = useState<'sell' | 'buy' | 'exchange'>('sell');
  const [showModal, setShowModal] = useState(false);

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  const [formCategory, setFormCategory] = useState<'sell' | 'buy' | 'exchange'>('sell');
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formDesc, setFormDesc] = useState('');

  // Загрузка объявлений из Supabase при открытии сайта
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      if (data) setAds(data);
    } catch (err) {
      console.error('Ошибка загрузки объявлений:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAd = {
      title: formTitle,
      category: formCategory,
      price: formPrice,
      specs: formSpecs || 'Стандарт',
      description: formDesc,
      gameId: gameId,
      contact: '@' + (telegramUser.username || 'user'),
      status: 'pending' as const,
    };

    try {
      const { data, error } = await supabase.from('ads').insert([newAd]).select();
      if (error) throw error;

      if (data) {
        setAds([data[0], ...ads]);
      }
      setShowModal(false);
      setFormTitle('');
      setFormPrice('');
      setFormSpecs('');
      setFormDesc('');
      alert('Объявление отправлено администратору на модерацию!');
    } catch (err) {
      alert('Ошибка при создании объявления!');
      console.error(err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;
      setAds(ads.map(ad => ad.id === id ? { ...ad, status: 'active' } : ad));
    } catch (err) {
      console.error('Ошибка при одобрении:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      setAds(ads.map(ad => ad.id === id ? { ...ad, status: 'rejected' } : ad));
    } catch (err) {
      console.error('Ошибка при отклонении:', err);
    }
  };

  const filteredAds = ads.filter(ad => ad.category === activeTab && ad.status === 'active');
  const pendingAds = ads.filter(ad => ad.status === 'pending');

  return (
    <main className="min-h-screen bg-gray-950 text-white font-sans pb-24 p-4">
      <div className="max-w-md mx-auto space-y-4">
        
        <header className="flex justify-between items-center bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Режим работы</span>
            <span className="font-bold text-yellow-400 text-xs">
              {currentView === 'marketplace' ? '🏪 Маркетплейс' : '🛡 Админ-панель'}
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentView(currentView === 'marketplace' ? 'admin' : 'marketplace')}
              className="bg-gray-800 hover:bg-gray-700 text-yellow-400 font-bold px-3 py-2 rounded-xl text-xs transition border border-gray-700"
            >
              {currentView === 'marketplace' ? '⚙️ Админка' : '🔙 К витрине'}
            </button>
            {currentView === 'marketplace' && (
              <button 
                onClick={() => setShowModal(true)}
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold px-3 py-2 rounded-xl text-xs transition shadow"
              >
                + Подать
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-xs">Загрузка данных из базы...</div>
        ) : currentView === 'admin' ? (
          <div className="space-y-3">
            <div className="bg-gray-900 border border-yellow-500/30 p-4 rounded-2xl space-y-1">
              <h2 className="font-bold text-sm text-yellow-400">Очередь модерации</h2>
              <p className="text-[11px] text-gray-400">Здесь появляются новые объявления игроков. Одобренные сразу попадают в публичную ленту.</p>
            </div>

            {pendingAds.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs bg-gray-900/50 border border-gray-800 rounded-2xl">
                Нет объявлений, ожидающих проверки. 🎉
              </div>
            ) : (
              pendingAds.map((ad) => (
                <div key={ad.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-md space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded uppercase font-bold">
                        {ad.category}
                      </span>
                      <h3 className="font-bold text-base text-white mt-1">{ad.title}</h3>
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
                    <span className="text-gray-500 font-mono text-[10px]">ID: {ad.gameId} | {ad.contact}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReject(ad.id)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl font-bold transition"
                      >
                        ❌ Отклонить
                      </button>
                      <button 
                        onClick={() => handleApprove(ad.id)}
                        className="bg-green-500 hover:bg-green-400 text-gray-950 px-3 py-1.5 rounded-xl font-bold transition shadow"
                      >
                        ✅ Одобрить
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md p-5 rounded-3xl space-y-4 shadow-2xl my-auto">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-base text-yellow-400">Новое объявление</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white font-bold text-sm">✕</button>
            </div>
            
            <form onSubmit={handleCreateAd} className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-medium">Тип</label>
                <select 
                  value={formCategory} onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="sell">Продажа</option>
                  <option value="buy">Покупка</option>
                  <option value="exchange">Обмен</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-medium">Название авто</label>
                <input 
                  type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="BMW M5 F90"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-medium">Мощность (hp / nm)</label>
                <input 
                  type="text" value={formSpecs} onChange={(e) => setFormSpecs(e.target.value)}
                  placeholder="1200hp (1200) / 1400nm (1400)"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-medium">Цена / Бюджет</label>
                <input 
                  type="text" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="15,000,000 с."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-medium">Описание</label>
                <textarea 
                  required value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Фулл тюнинг..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 h-20 resize-none"
                />
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