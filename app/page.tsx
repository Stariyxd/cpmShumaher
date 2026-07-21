'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import RegisterModal from '@/components/RegisterModal';
import ListingForm from '@/components/ListingForm';

export default function Home() {
  // Получаем реальные данные пользователя из Telegram WebApp
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
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

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
      .from('listings')
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
        telegram_id: telegramUser.id, 
        username: telegramUser.username, 
        game_id: inputGameId 
      }
    ]);

    if (!error) {
      setGameId(inputGameId);
      setIsRegistered(true);
      setShowRegModal(false);
    } else {
      alert('Ошибка при регистрации, попробуй еще раз.');
    }
  };

  // Создание объявления
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegistered) {
      setShowRegModal(true);
      return;
    }

    const { error } = await supabase.from('listings').insert([
      {
        title,
        price: Number(price),
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        game_id: gameId,
        status: 'pending'
      }
    ]);

    if (!error) {
      setTitle('');
      setPrice('');
      fetchListings();
      alert('Объявление отправлено на модерацию!');
    } else {
      alert('Не удалось создать объявление.');
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

      {/* Вынесенная форма создания объявления */}
      <ListingForm 
        title={title}
        setTitle={setTitle}
        price={price}
        setPrice={setPrice}
        onSubmit={handleCreateListing}
      />

      {/* Лента объявлений */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-300">Активные предложения</h2>
        {listings.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6">Пока нет объявлений</p>
        ) : (
          listings.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-white">{item.title}</h3>
                <p className="text-[11px] text-yellow-400 font-mono mt-0.5">${item.price.toLocaleString()}</p>
                <span className="text-[10px] text-gray-500">Продавец: @{item.username} (ID: {item.game_id})</span>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-lg ${
                item.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
                {item.status === 'approved' ? 'Активно' : 'На модерации'}
              </span>
            </div>
          ))
        )}
      </section>

      {/* Вынесенная модалка регистрации */}
      <RegisterModal 
        show={showRegModal}
        onSubmit={handleRegister}
        inputGameId={inputGameId}
        setInputGameId={setInputGameId}
      />
    </main>
  );
}