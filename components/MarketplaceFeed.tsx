'use client';

interface MarketplaceFeedProps {
  listings: any[];
  onRespond: (listing: any) => void;
}

export default function MarketplaceFeed({ listings, onRespond }: MarketplaceFeedProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Предложения рынка</h2>
      {listings.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-6">Пока нет объявлений</p>
      ) : (
        listings.map((item) => (
          <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex gap-3 items-center">
            {/* Картинка автомобиля, если она есть */}
            {(item.image_url || item.image_exterior) && (
              <img
                src={item.image_url || item.image_exterior}
                alt={item.title}
                className="w-20 h-20 object-cover rounded-xl border border-gray-800 shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    item.type === 'sell'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : item.type === 'buy'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}
                >
                  {item.type === 'sell' ? 'ПРОДАЖА' : item.type === 'buy' ? 'ПОКУПКА' : 'ОБМЕН'}
                </span>
                <h3 className="text-xs font-bold text-white truncate">{item.title}</h3>
              </div>

              {item.price && (
                <p className="text-[11px] text-yellow-400 font-mono mt-1">${item.price.toLocaleString()}</p>
              )}
              {item.exchange_terms && (
                <p className="text-[11px] text-purple-300 mt-1 truncate">Хочу: {item.exchange_terms}</p>
              )}
              {item.power && (
                <p className="text-[10px] text-gray-400 font-mono">Мощность: {item.power}</p>
              )}

              <span className="text-[10px] text-gray-500 block mt-1">Продавец ID: {item.game_id}</span>
            </div>

            <button
              onClick={() => onRespond(item)}
              className={`font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow shrink-0 ${
                item.status === 'reserved'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-gray-950'
              }`}
            >
              {item.status === 'reserved' ? '⏳ Идёт сделка' : 'Откликнуться'}
            </button>
          </div>
        ))
      )}
    </section>
  );
}