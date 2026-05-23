import React from 'react';
import { Droplet, Trash2, Zap, Route, FileText, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { IssueCategory } from '../types';
import { useLanguage } from '../LanguageContext';

interface CitizenPortalProps {
  onReportIssue: (category: IssueCategory) => void;
}

export function CitizenPortal({ onReportIssue }: CitizenPortalProps) {
  const { t } = useLanguage();

  const CATEGORIES = [
    { id: 'water', icon: Droplet, label: t.catWater, color: 'bg-[#F4F1EA] text-[#52796F]', border: 'border-[#E6E1D3] hover:border-[#52796F]' },
    { id: 'sanitation', icon: Trash2, label: t.catSanitation, color: 'bg-[#F4F1EA] text-[#A3B18A]', border: 'border-[#E6E1D3] hover:border-[#A3B18A]' },
    { id: 'electricity', icon: Zap, label: t.catElectricity, color: 'bg-[#F4F1EA] text-[#D46A43]', border: 'border-[#E6E1D3] hover:border-[#D46A43]' },
    { id: 'roads', icon: Route, label: t.catRoads, color: 'bg-[#F4F1EA] text-[#5A5A40]', border: 'border-[#E6E1D3] hover:border-[#5A5A40]' },
    { id: 'certificates', icon: FileText, label: t.catCertificates, color: 'bg-[#F4F1EA] text-[#8B8B7A]', border: 'border-[#E6E1D3] hover:border-[#8B8B7A]' },
    { id: 'other', icon: AlertTriangle, label: t.catOther, color: 'bg-[#F4F1EA] text-[#2C2C1E]', border: 'border-[#E6E1D3] hover:border-[#2C2C1E]' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#2C2C1E]">
          {t.welcomeTitle}
        </h2>
        <p className="text-[#8B8B7A] font-medium text-sm sm:text-base">
          {t.welcomeSub}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onReportIssue(cat.id as IssueCategory)}
              className={cn(
                "flex flex-col items-center justify-center p-6 sm:p-8 rounded-[24px] border transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 bg-white shadow-sm",
                cat.border,
                cat.color.split(' ')[1] // applying specific text color to container to pass to icon if needed
              )}
            >
              <div className={cn("p-4 rounded-xl mb-4 shadow-sm", cat.color.split(' ')[0])}>
                <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <span className="font-bold text-[#2C2C1E] text-center text-sm sm:text-base tracking-wide">
                {cat.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      <div className="mt-8 bg-[#A3B18A]/10 border border-[#E6E1D3] rounded-[24px] p-6 text-center shadow-sm">
        <p className="text-[#5A5A40] font-bold text-sm tracking-wide">{t.whatsappText}</p>
      </div>
    </div>
  );
}
