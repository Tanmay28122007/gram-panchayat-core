import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Clock, Scale } from 'lucide-react';

interface CropPrice {
  market: string;
  commodity: string;
  variety: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  date: string;
}

export function CropPrices() {
  const { t, lang } = useLanguage();
  const [prices, setPrices] = useState<CropPrice[]>([]);
  const [lastSynced, setLastSynced] = useState<string>('');
  const [isPerQuintal, setIsPerQuintal] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/v1/crop-prices');
        const data = await response.json();
        if (data.prices) {
          setPrices(data.prices);
        }
        if (data.lastSynced) {
          const syncDate = new Date(data.lastSynced);
          const hoursAgo = Math.floor((new Date().getTime() - syncDate.getTime()) / (1000 * 60 * 60));
          setLastSynced(hoursAgo > 0 ? `${hoursAgo} hours ago` : 'Just now');
        }
      } catch (err) {
        console.error("Failed to fetch crop prices", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTranslatedCommodity = (commodity: string) => {
    if (lang === 'en') return commodity;
    
    const gujaratiMap: Record<string, string> = {
      'Cotton': 'કપાસ',
      'Groundnut': 'મગફળી',
      'Jeera (Cumin)': 'જીરું',
      'Wheat': 'ઘઉં',
    };
    
    return gujaratiMap[commodity] || commodity;
  };
  
  const getTranslatedMarket = (market: string) => {
    if (lang === 'en') return market;
    
    const gujaratiMap: Record<string, string> = {
      'Gondal': 'ગોંડલ',
      'Rajkot': 'રાજકોટ',
      'Unjha': 'ઊંઝા',
      'Amreli': 'અમરેલી',
    };
    
    return gujaratiMap[market] || market;
  };

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-[#E6E1D3] overflow-hidden mt-8">
      <div className="p-6 border-b border-[#E6E1D3]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-5 h-5 text-[#A3B18A]" />
              <h3 className="text-xl font-serif font-bold text-[#2C2C1E]">{t.mandiPrices}</h3>
            </div>
            <p className="text-[#8B8B7A] text-sm">{t.mandiSub}</p>
          </div>
          
          <div className="flex items-center bg-[#F4F1EA] rounded-full p-1 border border-[#E6E1D3]">
            <button
              onClick={() => setIsPerQuintal(true)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                isPerQuintal 
                  ? 'bg-white text-[#52796F] shadow-sm' 
                  : 'text-[#8B8B7A] hover:bg-white/50'
              }`}
            >
              {t.perQuintal}
            </button>
            <button
              onClick={() => setIsPerQuintal(false)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                !isPerQuintal 
                  ? 'bg-white text-[#52796F] shadow-sm' 
                  : 'text-[#8B8B7A] hover:bg-white/50'
              }`}
            >
              {t.perMann}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FDFBF7] text-[#8B8B7A] text-xs uppercase tracking-wider">
              <th className="p-4 font-bold border-b border-[#E6E1D3] whitespace-nowrap">{t.market}</th>
              <th className="p-4 font-bold border-b border-[#E6E1D3] whitespace-nowrap">{t.commodity}</th>
              <th className="p-4 font-bold border-b border-[#E6E1D3] text-right whitespace-nowrap">{t.minPrice}</th>
              <th className="p-4 font-bold border-b border-[#E6E1D3] text-right whitespace-nowrap">{t.maxPrice}</th>
              <th className="p-4 font-bold border-b border-[#E6E1D3] text-right whitespace-nowrap">{t.modalPrice} {isPerQuintal ? '(₹/Q)' : '(₹/20kg)'}</th>
              <th className="p-4 font-bold border-b border-[#E6E1D3] text-right whitespace-nowrap">{t.lastUpdated}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-[#E6E1D3]/50 animate-pulse">
                  <td className="p-4"><div className="h-4 bg-[#E6E1D3] rounded w-20"></div></td>
                  <td className="p-4"><div className="h-4 bg-[#E6E1D3] rounded w-24"></div></td>
                  <td className="p-4 text-right"><div className="h-4 bg-[#E6E1D3] rounded w-16 ml-auto"></div></td>
                  <td className="p-4 text-right"><div className="h-4 bg-[#E6E1D3] rounded w-16 ml-auto"></div></td>
                  <td className="p-4 text-right"><div className="h-4 bg-[#E6E1D3] rounded w-16 ml-auto"></div></td>
                  <td className="p-4 text-right"><div className="h-4 bg-[#E6E1D3] rounded w-24 ml-auto"></div></td>
                </tr>
              ))
            ) : (
              prices.map((item, idx) => {
                const minPrice = isPerQuintal ? item.min_price : item.min_price / 5;
                const maxPrice = isPerQuintal ? item.max_price : item.max_price / 5;
                const modalPrice = isPerQuintal ? item.modal_price : item.modal_price / 5;
                
                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="border-b border-[#E6E1D3]/50 hover:bg-[#FDFBF7] transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-bold text-[#2C2C1E]">{getTranslatedMarket(item.market)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#2C2C1E]">{getTranslatedCommodity(item.commodity)}</div>
                      <div className="text-xs text-[#8B8B7A]">{item.variety}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-mono text-sm font-medium text-[#8B8B7A]">
                        {formatCurrency(minPrice)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-mono text-sm font-medium text-[#8B8B7A]">
                        {formatCurrency(maxPrice)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-mono text-lg font-bold text-[#52796F] flex items-center justify-end gap-1.5">
                        {formatCurrency(modalPrice)}
                        <TrendingUp className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-xs font-medium text-[#8B8B7A] bg-[#F4F1EA] px-2.5 py-1 rounded-full inline-block whitespace-nowrap">
                        {item.date}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {!loading && lastSynced && (
        <div className="p-4 bg-[#FDFBF7] text-xs font-bold text-[#8B8B7A] uppercase tracking-widest flex items-center gap-2 border-t border-[#E6E1D3]">
          <Clock className="w-4 h-4" /> 
          Last Synced: {lastSynced}
        </div>
      )}
    </div>
  );
}
