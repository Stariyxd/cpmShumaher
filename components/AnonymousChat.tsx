'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';

interface AnonymousChatProps {
  activeChat: any;
  chatMessages: any[];
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>;
  telegramUserId: string | number;
  onSendMessage: (content: string, type?: 'text' | 'image', mediaUrl?: string) => void;
  onCloseChat: (status: 'completed' | 'active') => void;
  onOpenDispute: () => void;
}

export default function AnonymousChat({
  activeChat,
  chatMessages,
  setChatMessages,
  telegramUserId,
  onSendMessage,
  onCloseChat,
  onOpenDispute,
}: AnonymousChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);

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
    onSendMessage(newMessage, 'text');
    setNewMessage('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${activeChat.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat_attachments')
      .upload(filePath, file);

    if (uploadError) {
      alert(`Ошибка загрузки файла: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('chat_attachments')
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      onSendMessage('Скриншот / Чек сделки', 'image', publicUrlData.publicUrl);
    }

    setUploading(false);
  };

  return (
    <section className="flex flex-col h-[75vh] bg-gray-900 border border-gray-800 rounded-2xl p-3">
      {/* Шапка чата с кнопками управления */}
      <div className="border-b border-gray-800 pb-2 mb-2 flex justify-between items-center">
        <div>
          <h2 className="text-xs font-bold text-yellow-400">💬 Чат сделки</h2>
          <p className="text-[10px] text-gray-400">Авто: {activeChat.listing.title}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onOpenDispute}
            title="Позвать администратора (Спор)"
            className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-xl text-[10px] font-bold transition"
          >
            🚨 Спор
          </button>
          <button
            onClick={() => onCloseChat('completed')}
            className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-xl text-[10px] font-bold transition"
          >
            ✅ Завершить
          </button>
          <button
            onClick={() => onCloseChat('active')}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-xl text-[10px] font-bold transition"
          >
            ❌ Отменить
          </button>
        </div>
      </div>

      {/* Список сообщений */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2">
        {chatMessages.length === 0 ? (
          <p className="text-[11px] text-gray-500 text-center py-10">Напишите первое сообщение или прикрепите скриншот...</p>
        ) : (
          chatMessages.map((msg) => {
            const isMe = String(msg.sender_telegram_id) === String(telegramUserId);
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] text-gray-500 mb-0.5">
                  {isMe ? 'Вы' : msg.sender_role === 'seller' ? '🚗 Продавец' : '🛒 Покупатель'}
                </span>
                <div
                  className={`p-2.5 rounded-xl text-xs max-w-[80%] ${
                    isMe ? 'bg-yellow-400 text-gray-950 font-medium' : 'bg-gray-800 text-white'
                  }`}
                >
                  {msg.message_type === 'image' && msg.media_url ? (
                    <div className="space-y-1">
                      <a href={msg.media_url} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={msg.media_url} 
                          alt="Чек" 
                          className="rounded-lg max-h-40 object-cover cursor-pointer hover:opacity-90 transition" 
                        />
                      </a>
                      <span className="text-[10px] block opacity-75">{msg.content}</span>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Форма отправки */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-gray-800 items-center">
        <label className={`cursor-pointer bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          📷
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            className="hidden" 
            disabled={uploading}
          />
        </label>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={uploading ? 'Загрузка фото...' : 'Сообщение...'}
          disabled={uploading}
          className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 disabled:opacity-50"
        />
        
        <button
          type="submit"
          disabled={uploading}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold px-4 py-2.5 rounded-xl text-xs transition disabled:opacity-50"
        >
          Отправить
        </button>
      </form>
    </section>
  );
}