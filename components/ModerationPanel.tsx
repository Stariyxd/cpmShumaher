'use client';

import { useState } from 'react';
import { supabase } from '@/supabase';

interface ModerationPanelProps {
  pendingListings: any[];
  disputedChats: any[];
  onAction: (id: number, status: 'active' | 'rejected') => void;
  onOpenChat: (chat: any) => void;
}

export default function ModerationPanel({
  pendingListings,
  disputedChats,
  onAction,
  onOpenChat,
}: ModerationPanelProps) {
  const [searchTelegramId, setSearchTelegramId] = useState('');
  const [targetUser, setTargetUser] = useState<any>(null);

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTelegramId.trim()) return;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', searchTelegramId.trim())
      .single();

    if (error || !data) {
      alert('Пользователь не найден');
      setTargetUser(null);
    } else {
      setTargetUser(data);
    }
  };

  const handleToggleBan = async (type: 'ban' | 'shadowban') => {
    if (!targetUser) return;

    const field = type === 'ban' ? 'is_banned' : 'is_shadowbanned';
    const currentValue = targetUser[field];

    const { error } = await supabase
      .from('users')
      .update({ [field]: !currentValue })
      .eq('telegram_id', targetUser.telegram_id);

    if (!error) {
      setTargetUser({ ...targetUser, [field]: !currentValue });
      alert(`Статус успешно изменен!`);
    } else {
      alert(`Ошибка: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Управление банами пользователей */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-3 space-y-3">
        <h2 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
          🔨 Управление блокировками
        </h2>
        <form onSubmit={handleSearchUser} className="flex gap-2">
          <input
            type="text"
            value={searchTelegramId}
            onChange={(e) => setSearchTelegramId(e.target.value)}
            placeholder="Введите Telegram ID..."
            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
          />
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            Найти
          </button>
        </form>

        {targetUser && (
          <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-2">
            <div className="text-xs space-y-1">
              <p>Пользователь: <span className="text-yellow-400">@{targetUser.username}</span></p>
              <p>Game ID: <span className="font-mono text-white">{targetUser.game_id}</span></p>
              <p>Бан: <span className={targetUser.is_banned ? 'text-red-400 font-bold' : 'text-green-400'}>{targetUser.is_banned ? 'Да' : 'Нет'}</span></p>
              <p>Теневой бан: <span className={targetUser.is_shadowbanned ? 'text-orange-400 font-bold' : 'text-green-400'}>{targetUser.is_shadowbanned ? 'Да' : 'Нет'}</span></p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => handleToggleBan('ban')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                  targetUser.is_banned 
                    ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}
              >
                {targetUser.is_banned ? 'Разбанить' : 'Забанить'}
              </button>
              <button
                type="button"
                onClick={() => handleToggleBan('shadowban')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                  targetUser.is_shadowbanned 
                    ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                    : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                }`}
              >
                {targetUser.is_shadowbanned ? 'Снять Shadowban' : 'Shadowban'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Спорные ситуации / Жалобы */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider">
          🚨 Споры в чатах ({disputedChats.length})
        </h2>
        {disputedChats.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4 bg-gray-900 border border-gray-800 rounded-2xl">
            Нет активных споров
          </p>
        ) : (
          disputedChats.map((chat) => (
            <div key={chat.id} className="bg-gray-900 border border-red-500/30 rounded-2xl p-3 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-red-400 font-mono">Спор в сделке #{chat.id}</span>
                  <h3 className="text-xs font-bold text-white mt-0.5">{chat.listing?.title || 'Автомобиль'}</h3>
                </div>
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] px-2 py-0.5 rounded-full font-medium">
                  Требует админа
                </span>
              </div>
              <button
                onClick={() => onOpenChat(chat)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-xs transition"
              >
                Подключиться к чату
              </button>
            </div>
          ))
        )}
      </section>

      {/* Ожидают проверки объявлений */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
          Ожидают проверки объявлений ({pendingListings.length})
        </h2>
        {pendingListings.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6 bg-gray-900 border border-gray-800 rounded-2xl">
            Нет новых заявок
          </p>
        ) : (
          pendingListings.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-3 space-y-2">
              <h3 className="text-xs font-bold text-white">{item.title}</h3>
              <div className="text-[11px] text-gray-300 space-y-0.5">
                {item.price && <p>Цена: <span className="text-yellow-400 font-mono">${item.price.toLocaleString()}</span></p>}
                <p>Автор: @{item.username} (ID: <span className="font-mono text-white">{item.game_id}</span>)</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                <button
                  onClick={() => onAction(item.id, 'active')}
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 font-bold py-2 rounded-xl text-xs transition"
                >
                  ✅ Одобрить
                </button>
                <button
                  onClick={() => onAction(item.id, 'rejected')}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-2 rounded-xl text-xs transition"
                >
                  ❌ Отклонить
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}