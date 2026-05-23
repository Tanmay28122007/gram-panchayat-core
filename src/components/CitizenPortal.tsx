import React, { useState } from 'react';
import { Droplet, Trash2, Zap, Route, FileText, AlertTriangle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { IssueCategory } from '../types';
import { useLanguage } from '../LanguageContext';
import { GovernmentSchemes } from './GovernmentSchemes';
import { SchemeCategories } from './SchemeCategories';

interface CitizenPortalProps {
  onReportIssue: (category: IssueCategory, description?: string) => void;
}

export function CitizenPortal({ onReportIssue }: CitizenPortalProps) {
  const { t } = useLanguage();
  const [selectedCat, setSelectedCat] = useState<IssueCategory | null>(null);
  const [reportText, setReportText] = useState('');

  const CATEGORIES = [
    { id: 'water', icon: Droplet, label: t.catWater, color: 'bg-[#F4F1EA] text-[#52796F]', border: 'border-[#E6E1D3] hover:border-[#52796F]' },
    { id: 'sanitation', icon: Trash2, label: t.catSanitation, color: 'bg-[#F4F1EA] text-[#A3B18A]', border: 'border-[#E6E1D3] hover:border-[#A3B18A]' },
    { id: 'electricity', icon: Zap, label: t.catElectricity, color: 'bg-[#F4F1EA] text-[#D46A43]', border: 'border-[#E6E1D3] hover:border-[#D46A43]' },
    { id: 'roads', icon: Route, label: t.catRoads, color: 'bg-[#F4F1EA] text-[#5A5A40]', border: 'border-[#E6E1D3] hover:border-[#5A5A40]' },
    { id: 'certificates', icon: FileText, label: t.catCertificates, color: 'bg-[#F4F1EA] text-[#8B8B7A]', border: 'border-[#E6E1D3] hover:border-[#8B8B7A]' },
    { id: 'other', icon: AlertTriangle, label: t.catOther, color: 'bg-[#F4F1EA] text-[#2C2C1E]', border: 'border-[#E6E1D3] hover:border-[#2C2C1E]' },
  ] as const;

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCat && reportText.trim()) {
      onReportIssue(selectedCat, reportText.trim());
      setReportText('');
      setSelectedCat(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <SchemeCategories />
      <GovernmentSchemes />
      
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
          const isSelected = selectedCat === cat.id;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedCat(isSelected ? null : cat.id as IssueCategory)}
              className={cn(
                "flex flex-col items-center justify-center p-6 sm:p-8 rounded-[24px] border transition-all focus:outline-none focus:ring-4 focus:ring-opacity-50 bg-white",
                isSelected ? `shadow-md border-[2px] ${cat.color.split(' ')[1].replace('text-', 'border-')} ring-2 ring-opacity-20 translate-y-0` : `shadow-sm hover:-translate-y-1 hover:shadow-lg ${cat.border}`,
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

      <AnimatePresence>
        {selectedCat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleSubmitForm}
              className="mt-6 bg-white border border-[#E6E1D3] p-6 rounded-[24px] shadow-sm flex flex-col gap-4"
            >
              <label className="font-bold text-[#2C2C1E]">
                {t.enterDetails} <span className="text-[#8B8B7A] ml-1">({CATEGORIES.find(c => c.id === selectedCat)?.label})</span>
              </label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="w-full h-32 p-4 rounded-xl border border-[#E6E1D3] focus:border-[#5A5A40] focus:outline-none resize-none bg-[#FDFBF7] text-[#5A5A40]"
                placeholder="..."
                required
              />
              <div className="flex gap-4 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCat(null)}
                  className="px-6 py-2 rounded-full font-bold text-[#8B8B7A] hover:bg-[#F4F1EA] transition-colors uppercase tracking-widest text-xs"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full font-bold text-white bg-[#5A5A40] hover:bg-[#2C2C1E] transition-colors flex items-center gap-2 uppercase tracking-widest text-xs"
                >
                  {t.submit} <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-8 bg-[#A3B18A]/10 border border-[#E6E1D3] rounded-[24px] p-6 text-center shadow-sm">
        <p className="text-[#5A5A40] font-bold text-sm tracking-wide">{t.whatsappText}</p>
      </div>
    </div>
  );
}
