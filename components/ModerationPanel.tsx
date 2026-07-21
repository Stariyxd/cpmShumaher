'use client';

interface ModerationPanelProps {
  pendingListings: any[];
  disputedChats: any[];
  onAction: (id: number, status: 'active' | 'rejected') => void;
  onOpenChat: (chat: any) => void;
  onResolveDispute?: (chatId: number, winnerRole: 'seller' | 'buyer', sanctionType: string) => void;
}

export default function ModerationPanel({
  pendingListings,
  disputedChats,
  onAction,
  onOpenChat,
  onResolveDispute,
}: ModerationPanelProps) {
  
  // Функция генерации HTML-отчета по спору
  const handleDownloadHtmlReport = (dispute: any, chat: any) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <title>Отчет по спору #${chat.id}</title>
        <style>
          body { background: #0f172a; color: #f8fafc; font-family: Arial, sans-serif; padding: 20px; }
          .card { background: #1e293b; border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
          h1, h2 { color: #facc15; }
          .meta { color: #94a3b8; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Арбитражный отчет по сделке #${chat.id}</h1>
        <div class="card">
          <h2>Информация о сделке</h2>
          <p class="meta">Лот: <b>${chat.listing?.title || 'Не указан'}</b></p>
          <p class="meta">Продавец (TG ID): ${chat.seller_id}</p>
          <p class="meta">Покупатель (TG ID): ${chat.buyer_id}</p>
        </div>
        <div class="card">
          <h2>Причина спора</h2>
          <p>${dispute?.reason || 'Причина не указана'}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispute_report_${chat.id}.html`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Секция споров и арбитража */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider">
          ⚠️ Открытые споры ({disputedChats.length})
        </h2>
        {disputedChats.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6 bg-gray-900 border border-gray-800 rounded-2xl">
            Нет активных споров
          </p>
        ) : (
          disputedChats.map((chat) => (
            <div key={chat.id} className="bg-gray-900 border border-red-500/30 rounded-2xl p-3 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-white">Спор по сделке #{chat.id}</h3>
                  <p className="text-[10px] text-gray-400">Лот: {chat.listing?.title}</p>
                </div>
                <button
                  onClick={() => onOpenChat(chat)}
                  className="bg-gray-800 hover:bg-gray-700 text-yellow-400 px-2.5 py-1 rounded-xl text-[10px]"
                >
                  💬 Смотреть чат
                </button>
              </div>

              {/* Кнопки вынесения решений и санкций */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800 text-[11px]">
                <button
                  onClick={() => handleDownloadHtmlReport({}, chat)}
                  className="col-span-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 py-2 rounded-xl font-bold transition"
                >
                  📥 Скачать HTML-отчёт
                </button>
                <button
                  onClick={() => onResolveDispute && onResolveDispute(chat.id, 'seller', 'warning')}
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 py-2 rounded-xl font-bold transition"
                >
                  ✅ В пользу продавца
                </button>
                <button
                  onClick={() => onResolveDispute && onResolveDispute(chat.id, 'buyer', 'warning')}
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 py-2 rounded-xl font-bold transition"
                >
                  ✅ В пользу покупателя
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Ожидают проверки объявлений (исходный код секции) */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
          Ожидают проверки объявлений ({pendingListings.length})
        </h2>
        {/* Список модерации объявлений */}
        {pendingListings.map((item) => (
          <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-3 space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-bold text-white">{item.title}</h3>
              <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-yellow-400 uppercase font-mono">
                {item.type}
              </span>
            </div>
            <div className="bg-gray-950 p-2 rounded-xl border border-gray-800 text-[11px] font-mono">
              <p className="text-gray-400">Автор: <span className="text-yellow-400">@{item.username}</span></p>
              <p className="text-gray-400">Game ID: <span className="text-white">{item.game_id}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
              <button
                onClick={() => onAction(item.id, 'active')}
                className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 font-bold py-2 rounded-xl text-xs"
              >
                ✅ Одобрить
              </button>
              <button
                onClick={() => onAction(item.id, 'rejected')}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-2 rounded-xl text-xs"
              >
                ❌ Отклонить
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}