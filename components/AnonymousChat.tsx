'use client';

import { useState } from 'react';

interface AnonymousChatProps {
  activeChat: any;
  chatMessages: any[];
  setChatMessages: (msgs: any[]) => void;
  telegramUserId: number | string;
  onSendMessage: (content: string, type?: 'text' | 'image', mediaUrl?: string | null) => void;
  onCloseChat: (status: 'completed' | 'active') => void;
  onOpenDispute: () => void; // Оставляем без аргументов здесь, так как модалку открываем на уровне page.tsx
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
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState<'chat' | 'deal_setup' | 'confirm'>('chat');
  
  // Данные сделки
  const [serverRegion, setServerRegion] = useState('RU');
  const [serverPassword, setServerPassword] = useState('');
  
  // Состояния для скриншотов подтверждения
  const [profileScreen, setProfileScreen] = useState<File | null>(null);
  const [proofScreen, setProofScreen] = useState<File | null>(null);

  const isSeller = String(activeChat.seller_id) === String(telegramUserId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col h-[75vh]">
      {/* Шапка чата */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-3">
        <div>
          <h2 className="text-xs font-bold text-yellow-400">Сделка по: {activeChat.listing?.title}</h2>
          <p className="text-[10px] text-gray-400">Анонимный чат (ID: {activeChat.id})</p>
        </div>
        <div className="flex gap-2">
          {step === 'chat' && (
            <button
              onClick={() => setStep('deal_setup')}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold px-3 py-1 rounded-xl text-[10px] transition"
            >
              🤝 Начать сделку
            </button>
          )}
          <button
  onClick={onOpenDispute}
  className="bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-2 py-1 rounded-xl text-[10px]"
>
  ⚠️ Спор
</button>
        </div>
      </div>

      {/* Основной контент: Чат или Мастер сделки */}
      {step === 'chat' ? (
        <>
          {/* История сообщений */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {chatMessages.length === 0 ? (
              <p className="text-center text-gray-500 py-10">Напишите первое сообщение...</p>
            ) : (
              chatMessages.map((msg, index) => {
                const isMe = String(msg.sender_telegram_id) === String(telegramUserId);
                return (
                  <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-gray-500 mb-0.5">
                      {isMe ? 'Вы' : '💬 Аноним'}
                    </span>
                    <div
                      className={`p-2.5 rounded-2xl max-w-[80%] ${
                        isMe ? 'bg-yellow-400 text-gray-950 rounded-br-none' : 'bg-gray-800 text-white rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Инпут отправки сообщения */}
          <form onSubmit={handleSend} className="mt-3 flex gap-2 pt-2 border-t border-gray-800">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
            />
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs"
            >
              ➤
            </button>
          </form>

          {/* Кнопки отмены снизу */}
          <div className="flex justify-between pt-2 mt-2 border-t border-gray-800/50">
            <button
              onClick={() => onCloseChat('active')}
              className="text-[10px] text-red-400 hover:underline"
            >
              ❌ Отменить сделку / Вернуть в ленту
            </button>
          </div>
        </>
      ) : step === 'deal_setup' ? (
        /* Шаг настройки сделки (Регион и пароль) */
        <div className="flex-1 flex flex-col justify-center space-y-4 text-xs">
          <h3 className="text-sm font-bold text-yellow-400 text-center">Оформление параметров сервера</h3>
          
          {isSeller ? (
            <div className="space-y-3 bg-gray-950 p-3 rounded-xl border border-gray-800">
              <div>
                <label className="text-gray-400 block mb-1">Регион сервера:</label>
                <select
                  value={serverRegion}
                  onChange={(e) => setServerRegion(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-white"
                >
                  <option value="RU">RU (Россия)</option>
                  <option value="EU">EU (Европа)</option>
                  <option value="US">US (Америка)</option>
                  <option value="Asia">Asia (Азия)</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Пароль сервера (если есть):</label>
                <input
                  type="text"
                  value={serverPassword}
                  onChange={(e) => setServerPassword(e.target.value)}
                  placeholder="Например: 1234 или пусто"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-white font-mono"
                />
              </div>
              <button
                onClick={() => setStep('confirm')}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold py-2.5 rounded-xl mt-2"
              >
                Перейти к подтверждению сделки
              </button>
            </div>
          ) : (
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-center space-y-2">
              <p className="text-gray-300">Ожидаем, пока продавец укажет регион и пароль сервера...</p>
              <button
                onClick={() => setStep('confirm')}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold py-2 px-4 rounded-xl mt-2"
              >
                Перейти к окну подтверждения
              </button>
            </div>
          )}

          <button onClick={() => setStep('chat')} className="text-center text-gray-400 text-[10px]">
            ← Вернуться в чат
          </button>
        </div>
      ) : (
        /* Финальный шаг: Подтверждение сделки и скриншоты */
        <div className="flex-1 overflow-y-auto space-y-3 text-xs">
          <h3 className="text-sm font-bold text-yellow-400 text-center">Подтверждение завершения сделки</h3>
          <p className="text-[11px] text-gray-400 text-center">Загрузите скриншоты из игры для закрытия сделки:</p>

          <div className="space-y-3 bg-gray-950 p-3 rounded-xl border border-gray-800">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">1. Скриншот профиля партнера</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileScreen(e.target.files?.[0] || null)}
                className="w-full text-[11px] text-gray-400 file:bg-gray-800 file:text-yellow-400 file:border-0 file:rounded-lg file:py-1 file:px-2"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">2. Скриншот сообщения о покупке/продаже</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofScreen(e.target.files?.[0] || null)}
                className="w-full text-[11px] text-gray-400 file:bg-gray-800 file:text-yellow-400 file:border-0 file:rounded-lg file:py-1 file:px-2"
              />
            </div>

            <button
              onClick={() => {
                if (!profileScreen || !proofScreen) {
                  alert('Нужно прикрепить оба скриншота!');
                  return;
                }
                onCloseChat('completed');
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-gray-950 font-bold py-2.5 rounded-xl mt-2 transition"
            >
              {activeChat.listing?.type === 'buy' ? '🛒 Я купил авто' : activeChat.listing?.type === 'sell' ? '💰 Я продал авто' : '🔄 Обмен прошёл успешно'}
            </button>
          </div>

          <button onClick={() => setStep('chat')} className="text-center text-gray-400 text-[10px] block w-full">
            ← Вернуться в чат
          </button>
        </div>
      )}
    </div>
  );
}