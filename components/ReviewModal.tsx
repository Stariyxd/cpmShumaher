'use client';

import { useState } from 'react';

interface ReviewModalProps {
  show: boolean;
  onSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
}

export default function ReviewModal({ show, onSubmit, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, comment);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 w-full max-w-sm space-y-4">
        <h2 className="text-sm font-bold text-yellow-400 text-center">⭐ Оцените сделку</h2>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Выбор звезд */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className={`text-xl transition ${rating >= star ? 'text-yellow-400' : 'text-gray-600'}`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ваш комментарий о сделке..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 h-20 resize-none"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl text-xs transition"
            >
              Пропустить
            </button>
            <button
              type="submit"
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold py-2.5 rounded-xl text-xs transition"
            >
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}