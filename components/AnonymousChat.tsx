'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';

interface AnonymousChatProps {
  activeChat: any;
  chatMessages: any[];
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>;
  telegramUserId: string | number;
  onSendMessage: (content: string) => void;
}

export default function AnonymousChat({
  activeChat,
  chatMessages,
  setChatMessages,
  telegramUserId,
  onSendMessage,
}: AnonymousChatProps) {
  const [newMessage, setNewMessage] = useState('');

  // Подписка на новые сообщения в реальном времени через Supabase Realtime
  useEffect(() => {
    if (!activeChat?.id) return;

    const channel = supabase
      .channel(`chat_${activeChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketplace_chat_logs',
          filter: `chat_id=eq.${activeChat.id}`,
        },
        (payload) => {
          // Добавляем новое сообщение в стейт, если его там еще нет
          setChatMessages((prev) => {
            if (prev.some((msg) => msg.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat?.id, setChatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <section className="flex flex-col h-[75vh] bg-gray-900 border border-gray-800 rounded-2xl p-3">
      <div className="border-b border-gray-800 pb-2 mb-2 flex justify-between items-center">
        <div>
          <h2 className="text-xs font-bold text-yellow-400">💬 Анонимный чат сделки</h2>
          <p className="text-[10px] text-gray-400">Авто: {activeChat.listing.title}</p>
        </div>
        <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
          ● Онлайн
        </span>
      </div>

      {/* Список сообщений */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2">
        {chatMessages.length === 0 ? (
          <p className="text-[11px] text-gray-500 text-center py-10">Напишите первое сообщение...</p>
        ) : (
          chatMessages.map((msg) => {
            const isMe = String(msg.sender_telegram_id) === String(telegramUserId);
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] text-gray-500 mb-0.5">
                  {isMe ? 'Вы' : '💬 Аноним'}
                </span>
                <div
                  className={`p-2.5 rounded-xl text-xs max-w-[80%] ${
                    isMe ? 'bg-yellow-400 text-gray-950 font-medium' : 'bg-gray-800 text-white'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Форма отправки */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-gray-800">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Сообщение..."
          className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
        />
        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold px-4 py-2.5 rounded-xl text-xs transition"
        >
          Отправить
        </button>
      </form>
    </section>
  );
}