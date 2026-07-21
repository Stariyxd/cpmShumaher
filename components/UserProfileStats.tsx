'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';

interface UserProfileStatsProps {
  telegramId: string | number;
  gameId: string;
}

export default function UserProfileStats({ telegramId, gameId }: UserProfileStatsProps) {
  const [stats, setStats] = useState({
    completedDeals: 0,
    activeDeals: 0,
    rating: 5.0,
    reviewsCount: 0,
  });
  const [topTraders, setTopTraders] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!telegramId) return;

      // Считаем завершенные сделки
      const { count: completedCount } = await supabase
        .from('marketplace_listings')
        .select('*', { count: 'exact', head: true })
        .eq('telegram_id', String(telegramId))
        .eq('status', 'completed');

      // Получаем отзывы
      const { data: reviews } = await supabase
        .from('marketplace_reviews')
        .select('rating')
        .eq('target_telegram_id', String(telegramId));

      let avgRating = 5.0;
      if (reviews && reviews.length > 0) {
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        avgRating = Number((sum / reviews.length).toFixed(1));
      }

      setStats({
        completedDeals: completedCount || 0,
        activeDeals: 0,
        rating: avgRating,
        reviewsCount: reviews?.length || 0,
      });

      // Получаем топ трейдеров по количеству завершенных сделок
      const { data: traders } = await supabase
        .from('users')
        .select('username, game_id')
        .eq('is_banned', false)
        .limit(5);

      if (traders) {
        setTopTraders(traders);
      }
    };

    fetchUserData();
  }, [telegramId]);

  return (
    <div className="space-y-4 text-xs">
      {/* Карточка личной статистики (/mystats) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
        <h2 className="font-bold text-yellow-400 uppercase tracking-wider text-[11px]">📊 Ваша статистика трейдера</h2>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">
            <span className="text-gray-400 block text-[10px]">Game ID</span>
            <span className="font-mono text-white font-bold">{gameId || 'Не указан'}</span>
          </div>
          <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">
            <span className="text-gray-400 block text-[10px]">Успешных сделок</span>
            <span className="font-mono text-green-400 font-bold">{stats.completedDeals}</span>
          </div>
          <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">
            <span className="text-gray-400 block text-[10px]">Рейтинг</span>
            <span className="font-mono text-yellow-400 font-bold">⭐ {stats.rating} ({stats.reviewsCount})</span>
          </div>
        </div>
      </div>

      {/* Топ трейдеров (/toptraders) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
        <h2 className="font-bold text-yellow-400 uppercase tracking-wider text-[11px]">🏆 Топ трейдеров площадки</h2>
        
        <div className="space-y-2">
          {topTraders.length === 0 ? (
            <p className="text-gray-500 text-center py-2">Список пуст</p>
          ) : (
            topTraders.map((trader, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-yellow-400">#{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">@{trader.username}</p>
                    <p className="text-[10px] text-gray-400">ID: {trader.game_id}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}