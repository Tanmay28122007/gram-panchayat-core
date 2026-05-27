import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Home, Users, Briefcase, IdCard, ShieldCheck, Truck, 
  GraduationCap, Building2, HeartPulse, Wrench, Search, Scale, 
  Banknote, MonitorSmartphone, Sun, UserMinus, Trophy
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface SchemeCategory {
  id: string;
  title_en: string;
  title_gu: string;
  icon_type: string;
  target_url: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'HomeModernIcon': return Home;
    case 'UserGroupIcon': return Users;
    case 'BriefcaseIcon': return Briefcase;
    case 'IdentificationIcon': return IdCard;
    case 'ShieldCheckIcon': return ShieldCheck;
    case 'TruckIcon': return Truck;
    case 'AcademicCapIcon': return GraduationCap;
    case 'BuildingLibraryIcon': return Building2;
    case 'HeartIcon': return HeartPulse;
    case 'HomeIcon': return Home;
    case 'WrenchScrewdriverIcon': return Wrench;
    case 'MagnifyingGlassIcon': return Search;
    case 'ScaleIcon': return Scale;
    case 'BanknotesIcon': return Banknote;
    case 'ComputerDesktopIcon': return MonitorSmartphone;
    case 'SunIcon': return Sun;
    case 'UserMinusIcon': return UserMinus;
    case 'TrophyIcon': return Trophy;
    default: return Search;
  }
};

export function SchemeCategories() {
  const { t, lang } = useLanguage();
  const [categories, setCategories] = useState<SchemeCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/v1/schemes/categories');
        const data = await response.json();
        
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Network Error: Using offline fallback structure.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="mb-10 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-[#5A5A40]/10 pb-4">
        <h3 className="text-2xl font-serif font-bold text-[#2C2C1E]">{t.schemesByCategory}</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-[#FDFBF7] border border-[#5A5A40]/10 rounded-[16px] p-4 flex flex-col items-center justify-center h-[120px]">
              <div className="w-8 h-8 bg-[#E6E1D3]/50 rounded-full mb-3"></div>
              <div className="h-3 bg-[#E6E1D3]/50 rounded w-3/4 mx-auto"></div>
            </div>
          ))
        ) : (
          categories.map((cat, i) => {
            const Icon = getIcon(cat.icon_type);
            const title = lang === 'gu' && cat.title_gu ? cat.title_gu : cat.title_en;
            return (
              <motion.a
                href={cat.target_url}
                target="_blank"
                rel="noreferrer"
                key={cat.id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
                className="group bg-white border border-[#5A5A40]/10 rounded-[16px] p-4 flex flex-col items-center justify-center text-center hover:scale-105 hover:shadow-sm hover:border-[#A3B18A] transition-all cursor-pointer h-[120px]"
              >
                <div className="w-10 h-10 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#5A5A40] group-hover:text-[#52796F] group-hover:bg-[#A3B18A]/10 transition-colors mb-3">
                  <Icon 
                    className="w-5 h-5" 
                    style={
                      i === 0 ? { fontSize: '18px' } : 
                      i === 13 ? { width: 'auto', height: 'auto' } : 
                      undefined
                    } 
                  />
                </div>
                <span 
                  className="font-bold font-sans text-[#5A5A40] text-[11px] leading-tight group-hover:text-[#2C2C1E] transition-colors line-clamp-2"
                  style={
                    i >= 0 && i <= 4 ? { fontSize: '12px' } :
                    i >= 5 && i <= 10 ? { fontSize: '13px' } :
                    i === 11 ? { fontSize: '14px' } :
                    i === 12 ? { fontSize: '13px' } :
                    i === 13 ? { fontSize: '12px' } :
                    undefined
                  }
                >
                  {title}
                </span>
              </motion.a>
            );
          })
        )}
      </div>

      <div className="flex justify-center mt-6">
        <a 
          href="https://www.india.gov.in/my-government/schemes"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#5A5A40]/20 text-xs font-bold text-[#5A5A40] uppercase tracking-wider hover:bg-[#F4F1EA] hover:text-[#2C2C1E] transition-colors"
        >
          {t.viewMoreSchemes}
        </a>
      </div>
    </div>
  );
}
