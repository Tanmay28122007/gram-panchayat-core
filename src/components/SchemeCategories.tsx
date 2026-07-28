import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Home, Users, Briefcase, IdCard, ShieldCheck, Truck, 
  GraduationCap, Building2, HeartPulse, Wrench, Search, Scale, 
  Banknote, MonitorSmartphone, Sun, UserMinus, Trophy
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { safeFetch } from '../lib/fetchUtils';

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

const FALLBACK_CATEGORIES: SchemeCategory[] = [
  { id: "agriculture", title_en: "Agriculture, Rural & Environment", title_gu: "કૃષિ, ગ્રામીણ અને પર્યાવરણ", icon_type: "HomeModernIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=agriculture" },
  { id: "benefits", title_en: "Benefits & Social development", title_gu: "લાભો અને સામાજિક વિકાસ", icon_type: "UserGroupIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=benefits" },
  { id: "business", title_en: "Business & Self-employed", title_gu: "વ્યવસાય અને સ્વ-રોજગાર", icon_type: "BriefcaseIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=business" },
  { id: "citizenship", title_en: "Citizenship, Visa & Passports", title_gu: "નાગરિકત્વ, વિઝા અને પાસપોર્ટ", icon_type: "IdentificationIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=citizenship" },
  { id: "defence", title_en: "Defence & Foreign affairs", title_gu: "સંરક્ષણ અને વિદેશી બાબતો", icon_type: "ShieldCheckIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=defence" },
  { id: "transport", title_en: "Driving & Transport", title_gu: "ડ્રાઇવિંગ અને ટ્રાન્સપોર્ટ", icon_type: "TruckIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=transport" },
  { id: "education", title_en: "Education & Learning", title_gu: "શિક્ષણ અને શિક્ષણ", icon_type: "AcademicCapIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=education" },
  { id: "governance", title_en: "Governance & Planning", title_gu: "શાસન અને આયોજન", icon_type: "BuildingLibraryIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=governance" },
  { id: "health", title_en: "Health & Wellness", title_gu: "આરોગ્ય અને સુખાકારી", icon_type: "HeartIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=health" },
  { id: "housing", title_en: "Housing & Local services", title_gu: "આવાસ અને સ્થાનિક સેવાઓ", icon_type: "HomeIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=housing" },
  { id: "infrastructure", title_en: "Infrastructure & Industries", title_gu: "ઇન્ફ્રાસ્ટ્રક્ચર અને ઉદ્યોગો", icon_type: "WrenchScrewdriverIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=infrastructure" },
  { id: "jobs", title_en: "Jobs", title_gu: "નોકરીઓ", icon_type: "MagnifyingGlassIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=jobs" },
  { id: "justice", title_en: "Justice, Law & Grievances", title_gu: "ન્યાય, કાયદો અને ફરિયાદો", icon_type: "ScaleIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=justice" },
  { id: "money", title_en: "Money & Taxes", title_gu: "નાણાં અને કરવેરા", icon_type: "BanknotesIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=money" },
  { id: "science", title_en: "Science, IT & Communication", title_gu: "વિજ્ઞાન, આઇટી અને સંચાર", icon_type: "ComputerDesktopIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=science" },
  { id: "tourism", title_en: "Travel & Tourism", title_gu: "મુસાફરી અને પ્રવાસન", icon_type: "SunIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=tourism" },
  { id: "welfare", title_en: "Welfare of Families", title_gu: "પરિવાારોનું કલ્યાણ", icon_type: "UserMinusIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=welfare" },
  { id: "youth", title_en: "Youth sports & Culture", title_gu: "યુવા રમતગમત અને સંસ્કૃતિ", icon_type: "TrophyIcon", target_url: "https://www.india.gov.in/my-government/schemes/search?schemeCategory=youth" }
];

export function SchemeCategories() {
  const { t, lang } = useLanguage();
  const [categories, setCategories] = useState<SchemeCategory[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await safeFetch('/api/v1/schemes/categories');
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.categories && data.categories.length > 0) {
              setCategories(data.categories);
              return;
            }
          }
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
