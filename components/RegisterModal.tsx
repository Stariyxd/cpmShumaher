'use client';

import { useState } from 'react';
import { supabase } from '@/supabase';

interface RegisterModalProps {
  telegramUser: { id: string; username: string };
  onRegistered: (gameId: string) => void;
}

export default function RegisterModal({ telegramUser, onRegistered }: RegisterModalProps) {
  const [gameId, setGameId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .upsert([
          {
            telegram_id: String(telegramUser.id),
            username: telegramUser.username,
            game_id: gameId.trim(),
            is_banned: false,
            is_shadowbanned: false
          }
        ], { onConflict: 'telegram_id' });

      if (error) throw error;
      onRegistered(gameId.trim());
    } catch (err: any) {
      alert(`Ошибка регистрации: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-sm space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Авторизация профиля</h2>
          <p className="text-xs text-gray-400">Введите ваш игровой ID, чтобы привязать его к вашему Telegram аккаунту.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Ваш игровой ID (например: AT808780)</label>
            <input
              type="text"
              required
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="AT..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-950 font-bold py-2.5 rounded-xl text-xs transition"
          >
            {loading ? 'Привязка...' : 'Подтвердить и войти'}
          </button>
        </form>
      </div>
    </div>
  );
}