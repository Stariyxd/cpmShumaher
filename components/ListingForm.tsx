'use client';

import { useState } from 'react';

interface ListingFormProps {
  onSubmit: (formData: {
    type: 'buy' | 'sell' | 'exchange';
    title: string;
    price: string;
    power: string;
    carType: string;
    exchangeTerms: string;
  }) => void;
}

export default function ListingForm({ onSubmit }: ListingFormProps) {
  const [type, setType] = useState<'buy' | 'sell' | 'exchange'>('sell');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [power, setPower] = useState('');
  const [carType, setCarType] = useState('обычный');
  const [exchangeTerms, setExchangeTerms] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      title,
      price,
      power,
      carType,
      exchangeTerms,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 space-y-3">
      <h2 className="text-sm font-bold text-yellow-400">Создать объявление</h2>

      {/* Выбор типа объявления */}
      <div className="grid grid-cols-3 gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
        <button
          type="button"
          onClick={() => setType('sell')}
          className={`py-2 rounded-lg font-medium transition ${
            type === 'sell' ? 'bg-yellow-400 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          💰 Продать
        </button>
        <button
          type="button"
          onClick={() => setType('buy')}
          className={`py-2 rounded-lg font-medium transition ${
            type === 'buy' ? 'bg-yellow-400 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          🛒 Купить
        </button>
        <button
          type="button"
          onClick={() => setType('exchange')}
          className={`py-2 rounded-lg font-medium transition ${
            type === 'exchange' ? 'bg-yellow-400 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          🔄 Обменять
        </button>
      </div>

      {/* Название авто или предмет обмена */}
      <div>
        <label className="block text-[11px] text-gray-400 mb-1">
          {type === 'exchange' ? 'Какое авто отдаете?' : 'Название автомобиля'}
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: BMW M5 F90"
          className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
        />
      </div>

      {/* Поля для Купить / Продать */}
      {type !== 'exchange' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">
              {type === 'sell' ? 'Цена ($)' : 'Бюджет ($)'}
            </label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="500000"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Мощность</label>
            <input
              type="text"
              value={power}
              onChange={(e) => setPower(e.target.value)}
              placeholder="1234hp (1234)"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
            />
          </div>
        </div>
      )}

      {/* Условия для обмена */}
      {type === 'exchange' && (
        <div>
          <label className="block text-[11px] text-gray-400 mb-1">Что хотите получить взамен?</label>
          <input
            type="text"
            required
            value={exchangeTerms}
            onChange={(e) => setExchangeTerms(e.target.value)}
            placeholder="Например: Дрифт марк иливнедорожник"
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
          />
        </div>
      )}

      {/* Тип авто */}
      <div>
        <label className="block text-[11px] text-gray-400 mb-1">Категория / Тюнинг</label>
        <select
          value={carType}
          onChange={(e) => setCarType(e.target.value)}
          className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
        >
          <option value="обычный">Обычный</option>
          <option value="винил">С винилом</option>
          <option value="шильды">С шильдиками</option>
          <option value="дрифт">Дрифт настройка</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-yellow-400/10"
      >
        Опубликовать заявку
      </button>
    </form>
  );
}