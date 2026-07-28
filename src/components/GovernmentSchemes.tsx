import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Radio } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { safeFetch } from '../lib/fetchUtils';

interface Scheme {
  title: string;
  description: string;
  url: string;
}

const DEFAULT_SCHEMES: Scheme[] = [
  { title: "PM-KISAN Samman Nidhi", description: "Direct income support of ₹6,000 per year to small and marginal farmer families.", url: "https://pmkisan.gov.in/" },
  { title: "Pradhan Mantri Awas Yojana (Gramin)", description: "Financial assistance for construction of pucca house with basic amenities for rural families.", url: "https://pmayg.nic.in/" },
  { title: "Pradhan Mantri Jan Dhan Yojana", description: "A National Mission for Financial Inclusion to ensure access to financial services.", url: "https://pmjdy.gov.in/" },
  { title: "Atal Pension Yojana", description: "Providing social security & guaranteed minimum monthly pension to workers in unorganised sector.", url: "https://pfrda.org.in/" },
  { title: "Swachh Bharat Mission (Gramin)", description: "Universal sanitation coverage scheme accelerating rural cleanliness and hygiene.", url: "https://swachhbharatmission.gov.in" },
  { title: "Pradhan Mantri Ujjwala Yojana", description: "Free LPG connections for women from Below Poverty Line (BPL) households.", url: "https://www.pmuy.gov.in/" }
];

export function GovernmentSchemes() {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState<Scheme[]>(DEFAULT_SCHEMES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await safeFetch('/api/schemes');
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.schemes && data.schemes.length > 0) {
              setSchemes(data.schemes);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch schemes', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  return (
    <div className="mb-10 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-xl font-serif font-bold text-[#2C2C1E]">{t.newGovSchemes}</h3>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#A3B18A]/20 rounded-full border border-[#A3B18A]/30">
          <Radio className="w-3.5 h-3.5 text-[#52796F] animate-pulse" />
          <span className="text-[10px] font-bold text-[#52796F] tracking-wider uppercase">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-[#E6E1D3] rounded-[24px] p-5 shadow-sm flex flex-col h-[180px]">
                <div className="h-4 bg-[#E6E1D3]/50 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-[#E6E1D3]/50 rounded w-full mb-2"></div>
                <div className="h-3 bg-[#E6E1D3]/50 rounded w-5/6 mb-auto"></div>
                <div className="h-4 bg-[#E6E1D3]/50 rounded w-1/4 mt-4"></div>
              </div>
            ))
          : schemes.map((scheme, i) => (
              <motion.a
                href={scheme.url}
                target="_blank"
                rel="noreferrer"
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-[#E6E1D3] rounded-[24px] p-5 shadow-sm hover:shadow-md hover:border-[#A3B18A] transition-all flex flex-col group h-[180px]"
              >
                <h4 className="font-bold text-[#2C2C1E] text-sm mb-2 line-clamp-2 group-hover:text-[#52796F] transition-colors">
                  {scheme.title}
                </h4>
                <p className="text-[#8B8B7A] text-xs leading-relaxed mb-auto line-clamp-3">
                  {scheme.description}
                </p>
                <div className="flex items-center gap-1.5 mt-4 text-[10px] font-bold text-[#D46A43] uppercase tracking-wider">
                  {t.readMore} <ExternalLink className="w-3 h-3" />
                </div>
              </motion.a>
            ))}
      </div>
    </div>
  );
}
