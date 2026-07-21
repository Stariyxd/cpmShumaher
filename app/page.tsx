'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [telegramUser, setTelegramUser] = useState<{ id: number; username?: string } | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Поле ввода для формы регистрации
  const [inputGameId, setInputGameId] = useState('');

  useEffect(() => {
    // Интеграция с Telegram WebApp SDK
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      
      const user = tg.initDataUnsafe?.user;
      if (user && user.id) {
        setTelegramUser({ id: user.id, username: user.username });
        checkUserRegistration(user.id);
      } else {
        // Тестовый режим для разработки в обычном браузере
        setTelegramUser({ id: 12345678, username: 'test_user' });
        setGameId(null); // Можешь поставить строку, чтобы протестировать без модалки
        setLoading(false);
      }
    } else {
      setTelegramUser({ id: 12345678, username: 'test_user' });
      setLoading(false);
    }
  }, []);

  // Функция проверки привязки Game ID в базе данных
  const checkUserRegistration = async (tgId: number) => {
    try {
      // Здесь будет запрос к твоей базе Supabase через API-роут Next.js
      // const res = await fetch(`/api/user?tg_id=${tgId}`);
      // const data = await res.json();
      
      // Пока имитируем ответ (представим, что у пользователя еще нет Game ID)
      setGameId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Обработка регистрации Game ID
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputGameId.trim()) return;

    // Здесь отправляем данные в бэкенд для жесткой привязки намертво:
    // 1. Создаем запись в game_players (если ее нет)
    // 2. Привязываем telegram_id к game_id в game_player_telegram

    alert(`Game ID ${inputGameId} успешно привязан!`);
    setGameId(inputGameId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-sm text-yellow-400 animate-pulse">Загрузка маркетплейса...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white font-sans p-4">
      {/* Если Game ID не привязан — показываем модальное окно регистрации намертво */}
      {!gameId && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-sm p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <h2 className="font-extrabold text-lg text-yellow-400">Обязательная регистрация</h2>
              <p className="text-xs text-gray-400">
                Для доступа к торгам укажите ваш игровой Game ID. Изменить его сможет только администратор.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-medium">Ваш Game ID в игре</label>
                <input 
                  type="text" 
                  required 
                  value={inputGameId} 
                  onChange={(e) => setInputGameId(e.target.value)}
                  placeholder="Например: 7841923"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-yellow-500/10"
              >
                Подтвердить и войти
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Основной интерфейс (будет доступен только после привязки) */}
      <div className="max-w-md mx-auto space-y-4">
        <header className="flex justify-between items-center bg-gray-900 border border-gray-800 p-4 rounded-2xl">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Игровой профиль</span>
            <span className="font-mono font-bold text-yellow-400 text-sm">ID: {gameId || 'Не привязан'}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Telegram</span>
            <span className="text-xs font-bold text-gray-200">@{telegramUser?.username || 'user'}</span>
          </div>
        </header>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-center space-y-2">
          <h3 className="font-bold text-base">Фундамент заложен!</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Авторизация по Game ID работает. Теперь переходим к Шагу 2 — созданию ленты маркетплейса с вкладками (Купить / Продать / Обмен).
          </p>
        </div>
      </div>
    </main>
  );
}