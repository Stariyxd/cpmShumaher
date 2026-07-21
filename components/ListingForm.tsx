'use client';

import { useState } from 'react';
import { supabase } from '@/supabase';

interface ListingFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export default function ListingForm({ onSubmit, onCancel }: ListingFormProps) {
  const [type, setType] = useState<'sell' | 'buy' | 'exchange'>('sell');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(''); // Используется как цена (для sell) или бюджет (для buy)
  const [power, setPower] = useState('');
  const [carType, setCarType] = useState('Легковая');
  const [exchangeTerms, setExchangeTerms] = useState('');
  
  const [exteriorFile, setExteriorFile] = useState<File | null>(null);
  const [specsFile, setSpecsFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Скриншоты обязательны только для продажи и обмена
    if (type !== 'buy' && (!exteriorFile || !specsFile)) {
      alert('Для продажи и обмена обязательно нужно загрузить 2 скриншота: внешний вид и характеристики!');
      return;
    }

    setLoading(true);

    try {
      let exteriorUrl = null;
      let specsUrl = null;

      if (exteriorFile) {
        const fileExt = exteriorFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `exterior/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, exteriorFile);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);

        exteriorUrl = publicData.publicUrl;
      }

      if (specsFile) {
        const fileExt = specsFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `specs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, specsFile);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);

        specsUrl = publicData.publicUrl;
      }

      onSubmit({
        type,
        title,
        price,
        power,
        carType,
        exchangeTerms,
        image_exterior: exteriorUrl,
        image_specs: specsUrl,
      });
    } catch (error: any) {
      alert(`Ошибка при загрузке изображений: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Создать объявление</h2>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white text-xs">✕ Отмена</button>
      </div>

      {/* Выбор типа */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setType('sell')}
          className={`py-2 rounded-xl text-xs font-bold transition border ${
            type === 'sell' ? 'bg-yellow-400 text-gray-950 border-yellow-400' : 'bg-gray-950 text-gray-400 border-gray-800'
          }`}
        >
          Продажа
        </button>
        <button
          type="button"
          onClick={() => setType('exchange')}
          className={`py-2 rounded-xl text-xs font-bold transition border ${
            type === 'exchange' ? 'bg-yellow-400 text-gray-950 border-yellow-400' : 'bg-gray-950 text-gray-400 border-gray-800'
          }`}
        >
          Обмен
        </button>
        <button
          type="button"
          onClick={() => setType('buy')}
          className={`py-2 rounded-xl text-xs font-bold transition border ${
            type === 'buy' ? 'bg-yellow-400 text-gray-950 border-yellow-400' : 'bg-gray-950 text-gray-400 border-gray-800'
          }`}
        >
          Куплю
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[11px] text-gray-400 block mb-1">
            {type === 'buy' ? 'Какое авто хотите купить?' : 'Название автомобиля / Запчасти'}
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'buy' ? 'Например: BMW M5 F90' : 'Например: BMW M5 F90'}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
          />
        </div>

        {type !== 'exchange' && (
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">
              {type === 'buy' ? 'Бюджет (в игровой валюте)' : 'Цена (в игровой валюте)'}
            </label>
            <input
              type="number"
              required={type === 'sell' || type === 'buy'}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="15000000"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">
              {type === 'buy' ? 'Желаемая мощность (опционально)' : 'Мощность / Л.С.'}
            </label>
            <input
              type="text"
              value={power}
              onChange={(e) => setPower(e.target.value)}
              placeholder="1625hp (1625)"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Тип авто</label>
            <select
              value={carType}
              onChange={(e) => setCarType(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="Легковая">Легковая</option>
              <option value="Внедорожник">Внедорожник</option>
              <option value="Спорткар">Спорткар</option>
              <option value="Грузовой">Грузовой</option>
              <option value="Дрифт">Дрифт</option>
            </select>
          </div>
        </div>

        {type === 'exchange' && (
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Условия обмена</label>
            <input
              type="text"
              required
              value={exchangeTerms}
              onChange={(e) => setExchangeTerms(e.target.value)}
              placeholder="На что хотите обменять?"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
            />
          </div>
        )}

        {/* Скриншоты нужны только для продажи и обмена */}
        {type !== 'buy' && (
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <p className="text-[11px] text-yellow-400 font-bold">📸 Обязательные скриншоты:</p>
            
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">1. Внешний вид автомобиля</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setExteriorFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-800 file:text-yellow-400 hover:file:bg-gray-700"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">2. Характеристики автомобиля</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSpecsFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-800 file:text-yellow-400 hover:file:bg-gray-700"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-950 font-bold py-2.5 rounded-xl text-xs transition"
      >
        {loading ? 'Обработка...' : 'Опубликовать объявление'}
      </button>
    </form>
  );
}