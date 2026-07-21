'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import RegisterModal from '@/components/RegisterModal';
import ListingForm from '@/components/ListingForm';

export default function Home() {
  const webAppUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
  
  const [telegramUser] = useState({ 
    id: webAppUser?.id || 0, 
    username: webAppUser?.username || 'guest' 
  });

  const [gameId, setGameId] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [inputGameId, setInputGameId] = useState('');
  
  const [listings, setListings] = useState<any[]>([]);

  // Инициализация WebApp
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // Проверка регистрации в Supabase
  useEffect(() => {
    const checkUserRegistration = async () => {
      if (!telegramUser.id) return;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (data) {
        setGameId(data.game_id);
        setIsRegistered(true);
      } else {
        setShowRegModal(true);
      }
    };

    checkUserRegistration();
    fetchListings();
  }, [telegramUser.id]);

  // Загрузка ленты объявлений
  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setListings(data || []);
    }
  };

  // Регистрация нового юзера
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputGameId) return;

    const { error } = await supabase.from('users').insert([
      { 
        telegram_id: String(telegramUser.id), 
        username: telegramUser.username, 
        game_id: inputGameId 
      }
    ]);

    if (!error) {
      setGameId(inputGameId);
      setIsRegistered(true);
      setShowRegModal(false);
    } else {
      alert(`Ошибка регистрации: ${error.message}`);
    }
  };

  // Функция отправки уведомления администратору в Telegram
  const sendTelegramNotification = async (formData: any, username: string, userGameId: string) => {
    const BOT_TOKEN = 'ВСТАВЬ_СЮДА_ТОКЕН_БОТА'; 
    const ADMIN_CHAT_ID = 'ВСТАВЬ_СЮДА_ТВОЙ_TELEGRAM_ID'; 

    const typeEmoji = formData.type === 'sell' ? '💰 Продажа' : formData.type === 'buy' ? '🛒 Покупка' : '🔄 Обмен';

    const message = `🔔 **Новая заявка на модерацию! (${typeEmoji})**\n\n` +
      `🚗 Предмет: ${formData.title}\n` +
      (formData.price ? `💰 Цена/Бюджет: $${Number(formData.price).toLocaleString()}\n` : '') +
      (formData.power ? `⚡ Мощность: ${formData.power}\n` : '') +
      (formData.exchangeTerms ? `🎯 Условия: ${formData.exchangeTerms}\n` : '') +
      `🏷 Категория: ${formData.carType}\n` +
      `👤 Продавец: @${username} (Game ID: ${userGameId})`;

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
    } catch (err) {
      console.error('Ошибка отправки уведомления в Telegram:', err);
    }
  };

  // Создание объявления
  const handleCreateListing = async (formData: {
    type: 'buy' | 'sell' | 'exchange';
    title: string;
    price: string;
    power: string;
    carType: string;
    exchangeTerms: string;
  }) => {
    if (!isRegistered) {
      setShowRegModal(true);
      return;
    }

    const numericPrice = formData.price ? Number(formData.price) : null;

    const { error } = await supabase.from('marketplace_listings').insert([
      {
        type: formData.type,
        title: formData.title,
        price: numericPrice,
        power: formData.power || null,
        car_type: formData.carType,
        exchange_terms: formData.exchangeTerms || null,
        telegram_id: String(telegramUser.id),
        username: telegramUser.username,
        game_id: gameId,
        status: 'pending'
      }
    ]);

    if (!error) {
      await sendTelegramNotification(formData, telegramUser.username, gameId);
      fetchListings();
      alert('Объявление успешно отправлено на модерацию!');
    } else {
      alert(`Не удалось создать объявление: ${error.message}`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 max-w-md mx-auto relative font-sans">
      {/* Шапка */}
      <header className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
          <h1 className="font-bold text-lg text-yellow-400">CPM Marketplace</h1>
          <p className="text-xs text-gray-400">@{telegramUser.username}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-xs">
          <span className="text-gray-400">ID: </span>
          <span className="font-mono text-yellow-400">{gameId || 'Не указан'}</span>
        </div>
      </header>

      {/* Форма создания расширенного объявления */}
      <ListingForm onSubmit={handleCreateListing} />

      {/* Лента объявлений */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-300">Активные предложения</h2>
        {listings.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6">Пока нет объявлений</p>
        ) : (
          listings.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    item.type === 'sell' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    item.type === 'buy' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {item.type === 'sell' ? 'ПРОДАЖА' : item.type === 'buy' ? 'ПОКУПКА' : 'ОБМЕН'}
                  </span>
                  <h3 className="text-xs font-bold text-white">{item.title}</h3>
                </div>

                {item.price && (
                  <p className="text-[11px] text-yellow-400 font-mono mt-1">${item.price.toLocaleString()}</p>
                )}
                {item.exchange_terms && (
                  <p className="text-[11px] text-purple-300 mt-1">Хочу: {item.exchange_terms}</p>
                )}
                {item.power && (
                  <p className="text-[10px] text-gray-400 font-mono">Мощность: {item.power}</p>
                )}

                <span className="text-[10px] text-gray-500 block mt-1">Продавец: @{item.username} (ID: {item.game_id})</span>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-lg ${
                item.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                'bg-gray-800 text-gray-400'
              }`}>
                {item.status === 'active' ? 'Активно' : item.status === 'pending' ? 'На модерации' : item.status}
              </span>
            </div>
          ))
        )}
      </section>

      {/* Модалка регистрации */}
      <RegisterModal 
        show={showRegModal}
        onSubmit={handleRegister}
        inputGameId={inputGameId}
        setInputGameId={setInputGameId}
      />
    </main>
  );
}