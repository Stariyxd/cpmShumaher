'use client';

interface ModerationPanelProps {
  pendingListings: any[];
  onAction: (id: number, status: 'active' | 'rejected') => void;
}

export default function ModerationPanel({ pendingListings, onAction }: ModerationPanelProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
        Ожидают проверки ({pendingListings.length})
      </h2>
      {pendingListings.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-6">Нет новых заявок</p>
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
  );
}