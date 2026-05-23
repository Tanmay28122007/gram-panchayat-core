import React, { useState } from 'react';
import { ViewState, IssueCategory } from './types';
import { mockIssues, mockLedger } from './data';
import { CitizenPortal } from './components/CitizenPortal';
import { SarpanchDashboard } from './components/SarpanchDashboard';
import { FinanceLedger } from './components/FinanceLedger';
import { SarpanchLogin } from './components/SarpanchLogin';
import { SeasonPanel } from './components/SeasonPanel';
import { LayoutDashboard, Users, PieChart, Globe, CloudSun } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageProvider, useLanguage } from './LanguageContext';

function MainApp() {
  const { t, lang, setLang } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewState | 'season'>('citizen');
  const [issues, setIssues] = useState(mockIssues);
  const [ledger, setLedger] = useState(mockLedger);
  const [isSarpanchAuthenticated, setIsSarpanchAuthenticated] = useState(false);

  const handleReportIssue = (category: IssueCategory, description?: string) => {
    // Just mock an issue addition
    const newIssue = {
      id: `TKT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: `New ${category} issue reported`,
      category,
      description: description || 'Automatically added from Citizen Portal QR scan placeholder.',
      location: 'GPS Tagged Location',
      reporter: '99999XXXXX',
      upvotes: 0,
      status: 'green' as const,
      reportedAt: new Date().toISOString(),
      escalated: false,
    };
    setIssues((prev) => [newIssue, ...prev]);
    // Optionally switch view to show it, or stay
    alert(t.alertReported);
  };

  const handleEscalate = (id: string) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, escalated: true, status: 'red' } : i))
    );
  };

  const handleResolve = (id: string) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              proofImageUrl: 'https://images.unsplash.com/photo-1541888040058-005809633e70?q=80&w=200&auto=format&fit=crop',
            }
          : i
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D3D3D] font-sans selection:bg-[#A3B18A]/30">
      {/* Top Navigation */}
      <nav className="bg-white/50 backdrop-blur-md border-b border-[#E6E1D3] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xl">
                V
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-serif font-bold text-[#2C2C1E] tracking-tight leading-tight">{t.title}</h1>
                <p className="text-[10px] text-[#8B8B7A] uppercase tracking-widest leading-none">{t.subtitle}</p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-4 items-center">
              <button
                onClick={() => setLang(lang === 'en' ? 'gu' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E6E1D3] text-xs font-bold text-[#5A5A40] hover:bg-[#F4F1EA] transition-colors"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === 'en' ? 'ગુજરાતી' : 'English'}
              </button>
              
              <div className="flex gap-1 sm:gap-2">
                <NavButton
                  active={currentView === 'citizen'}
                  onClick={() => setCurrentView('citizen')}
                  icon={Users}
                  label={t.navCitizen}
                />
                <NavButton
                  active={currentView === 'sarpanch'}
                  onClick={() => setCurrentView('sarpanch')}
                  icon={LayoutDashboard}
                  label={t.navSarpanch}
                />
                <NavButton
                  active={currentView === 'finance'}
                  onClick={() => setCurrentView('finance')}
                  icon={PieChart}
                  label={t.navFinance}
                />
                <NavButton
                  active={currentView === 'season'}
                  onClick={() => setCurrentView('season')}
                  icon={CloudSun}
                  label={t.navSeason}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {currentView === 'citizen' && (
              <CitizenPortal onReportIssue={handleReportIssue} />
            )}
            {currentView === 'sarpanch' && (
              isSarpanchAuthenticated ? (
                <SarpanchDashboard
                  issues={issues}
                  onEscalate={handleEscalate}
                  onResolve={handleResolve}
                />
              ) : (
                <SarpanchLogin onLogin={() => setIsSarpanchAuthenticated(true)} />
              )
            )}
            {currentView === 'finance' && (
              <FinanceLedger entries={ledger} />
            )}
            {currentView === 'season' && (
              <SeasonPanel />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer",
        active
          ? "bg-[#A3B18A]/20 text-[#52796F]"
          : "text-[#8B8B7A] hover:text-[#5A5A40] hover:bg-[#F4F1EA]"
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
