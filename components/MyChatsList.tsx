'use client';

interface MyChatsListProps {
  chats: any[];
  onOpenChat: (chat: any) => void;
}

export default function MyChatsList({ chats, onOpenChat }: MyChatsListProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Мои сделки и чаты</h2>
      {chats.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-6">У вас пока нет активных сделок</p>
      ) : (
        chats.map((chat) => (
          <div key={chat.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-yellow-400 font-mono">Сделка #{chat.id}</span>
              <h3 className="text-xs font-bold text-white mt-0.5">{chat.listing?.title || 'Автомобиль'}</h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Статус: <span className="text-green-400 font-medium">{chat.status}</span>
              </p>
            </div>

            <button
              onClick={() => onOpenChat(chat)}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow"
            >
              Открыть чат
            </button>
          </div>
        ))
      )}
    </section>
  );
}