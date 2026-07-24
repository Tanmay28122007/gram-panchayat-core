import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Lock } from 'lucide-react';

export function SarpanchLogin({ onLogin }: { onLogin: () => void }) {
  const { t } = useLanguage();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '7890') {
      onLogin();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 bg-[#F4F1EA] rounded-full flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-[#5A5A40]" />
      </div>
      <h2 className="text-2xl font-serif font-bold tracking-tight text-[#2C2C1E] mb-8 text-center">
        {t.sarpanchLogin}
      </h2>

      <form onSubmit={handleSubmit} className="w-full space-y-6 flex flex-col items-center">
        <div className="flex flex-col items-center space-y-2 w-full">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setError(false);
            }}
            placeholder="****"
            className="text-center text-4xl tracking-[0.5em] sm:tracking-[1em] font-mono w-48 bg-transparent border-b-2 border-[#E6E1D3] focus:border-[#A3B18A] focus:outline-none placeholder:text-[#E6E1D3] pb-2 text-[#2C2C1E]"
            autoFocus
          />
          {error && <p className="text-sm font-bold text-[#D46A43] mt-2">{t.invalidPin}</p>}
          <p className="text-xs text-[#8B8B7A] mt-4 opacity-70">Demo PIN: 7890</p>
        </div>
        
        <button
          type="submit"
          disabled={pin.length !== 4}
          className="px-8 py-3 bg-[#5A5A40] text-white rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-opacity outline-none focus:ring-4 focus:ring-opacity-50"
        >
          {t.loginBtn}
        </button>
      </form>
    </div>
  );
}
