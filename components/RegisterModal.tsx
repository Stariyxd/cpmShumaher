'use client';

interface RegisterModalProps {
  show: boolean;
  onSubmit: (e: React.FormEvent) => void;
  inputGameId: string;
  setInputGameId: (val: string) => void;
}

export default function RegisterModal({ show, onSubmit, inputGameId, setInputGameId }: RegisterModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-yellow-500/50 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
        <h2 className="font-bold text-lg text-yellow-400 text-center">Добро пожаловать в Маркет! 🚗</h2>
        <p className="text-xs text-gray-400 text-center">
          Для публикации объявлений и привязки игрового профиля укажи свой Game ID из Car Parking Multiplayer.
        </p>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] text-gray-400 block mb-1 font-medium">Твой Game ID</label>
            <input 
              type="text" 
              required 
              value={inputGameId} 
              onChange={(e) => setInputGameId(e.target.value)}
              placeholder="Например: 7841923 или AB123456"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-yellow-500 font-mono text-center uppercase"
           />
          </div>

          <button 
            type="submit" 
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold py-3.5 rounded-xl text-xs transition shadow-lg cursor-pointer"
          >
            Завершить регистрацию
          </button>
        </form>
      </div>
    </div>
  );
}