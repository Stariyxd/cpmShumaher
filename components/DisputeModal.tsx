'use client';

import { useState } from 'react';

interface DisputeModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (reason: string, files: FileList | null) => void;
}

export default function DisputeModal({ show, onClose, onSubmit }: DisputeModalProps) {
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      alert('Пожалуйста, опишите причину подробно (минимум 5 символов)');
      return;
    }
    onSubmit(reason, files);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 w-full max-w-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider">⚠️ Открытие спора</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xs">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-gray-400 block mb-1">Причина спора / Описание проблемы:</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Опишите, что пошло не так..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-400 resize-none"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Доказательства (скриншоты, видео):</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setFiles(e.target.files)}
              className="w-full text-gray-400 file:bg-gray-800 file:text-red-400 file:border-0 file:rounded-xl file:py-2 file:px-3 text-[11px]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition"
          >
            ✅ Отправить спор администратору
          </button>
        </form>
      </div>
    </div>
  );
}