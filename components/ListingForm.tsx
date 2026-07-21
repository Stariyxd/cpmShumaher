'use client';

interface ListingFormProps {
  title: string;
  setTitle: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ListingForm({ title, setTitle, price, setPrice, onSubmit }: ListingFormProps) {
  return (
    <section className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 shadow-xl">
      <h2 className="text-sm font-bold mb-3 text-yellow-400">Новое объявление</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="text-[11px] text-gray-400 block mb-1">Название машины / товара</label>
          <input 
            type="text" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Ford F-750 Full Tune"
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
          />
        </div>
        <div>
          <label className="text-[11px] text-gray-400 block mb-1">Цена ($)</label>
          <input 
            type="number" 
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1000000"
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold py-3 rounded-xl text-xs transition shadow-lg cursor-pointer"
        >
          Опубликовать
        </button>
      </form>
    </section>
  );
}