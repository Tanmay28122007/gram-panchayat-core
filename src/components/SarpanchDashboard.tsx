import React from 'react';
import { Issue } from '../types';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Clock, MapPin, ThumbsUp, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../LanguageContext';

interface SarpanchDashboardProps {
  issues: Issue[];
  onEscalate: (id: string) => void;
  onResolve: (id: string) => void;
}

export function SarpanchDashboard({ issues, onEscalate, onResolve }: SarpanchDashboardProps) {
  const { t } = useLanguage();
  
  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'green': return 'bg-[#F0FDF4] text-green-900 border-green-200';
      case 'yellow': return 'bg-[#FEF9C3] text-yellow-900 border-yellow-200';
      case 'red': return 'bg-[#FFE5E5] text-red-900 border-red-200';
      case 'resolved': return 'bg-[#F4F1EA] text-[#8B8B7A] border-[#E6E1D3]';
    }
  };

  const getStatusLabel = (status: Issue['status']) => {
    switch (status) {
      case 'green': return t.new;
      case 'yellow': return t.pending;
      case 'red': return t.overdue;
      case 'resolved': return t.resolved;
    }
  };

  const sortedIssues = [...issues].sort((a, b) => {
    // Red -> Yellow -> Green -> Resolved
    const statusWeight = { red: 0, yellow: 1, green: 2, resolved: 3 };
    if (statusWeight[a.status] !== statusWeight[b.status]) {
      return statusWeight[a.status] - statusWeight[b.status];
    }
    // Then by upvotes desc
    if (b.upvotes !== a.upvotes) {
      return b.upvotes - a.upvotes;
    }
    // Then by date
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-serif font-bold tracking-tight text-[#2C2C1E]">{t.dashboardTitle}</h2>
          <p className="text-[#8B8B7A] text-sm">{t.dashboardSub}</p>
        </div>
        <div className="flex gap-4 text-xs font-bold text-[#8B8B7A] uppercase tracking-wider">
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div>{t.overdue}</div>
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>{t.pending}</div>
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>{t.new}</div>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedIssues.map((issue, index) => (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-[#E6E1D3] rounded-[24px] p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 md:items-center justify-between"
          >
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest flex items-center gap-1.5", getStatusColor(issue.status))}>
                  {issue.status === 'red' && <AlertCircle className="w-3.5 h-3.5" />}
                  {issue.status === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {getStatusLabel(issue.status)}
                </span>
                <span className="text-[10px] text-[#8B8B7A] font-mono font-bold tracking-widest">{issue.id}</span>
                {issue.escalated && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest bg-[#D46A43]/10 text-[#D46A43] border-[#D46A43]/20 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> {t.escalated}
                  </span>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2C2C1E]">{issue.title}</h3>
                <p className="text-[#3D3D3D] text-sm mt-1">{issue.description}</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-[#8B8B7A] flex-wrap uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {issue.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {new Date(issue.reportedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5 text-[#D46A43] bg-white border border-[#E6E1D3] px-2 py-1 rounded-md">
                  <ThumbsUp className="w-4 h-4" /> {issue.upvotes} {t.upvotes}
                </div>
              </div>
            </div>

            <div className="flex md:flex-col gap-3 min-w-[140px]">
              {issue.status !== 'resolved' && (
                <>
                  <button 
                    onClick={() => onResolve(issue.id)}
                    className="flex-1 bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer border border-black/10"
                  >
                    {t.markResolved}
                  </button>
                  {!issue.escalated && (
                    <button 
                      onClick={() => onEscalate(issue.id)}
                      className="flex-1 bg-[#F4F1EA] hover:bg-[#E6E1D3] text-[#D46A43] border border-[#E6E1D3] px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer"
                    >
                      {t.escalate}
                    </button>
                  )}
                </>
              )}
              {issue.status === 'resolved' && (
                <div className="flex flex-col items-center justify-center gap-2 p-3 bg-[#F9F7F2] rounded-xl border border-[#E6E1D3] w-full">
                  <span className="text-[10px] uppercase font-bold text-[#8B8B7A] tracking-widest">{t.proofOfFix}</span>
                  {issue.proofImageUrl ? (
                    <img src={issue.proofImageUrl} alt="Proof" className="w-16 h-16 rounded-lg object-cover border border-[#E6E1D3]" />
                  ) : (
                    <div className="text-xs text-[#8B8B7A] italic">{t.photoVerified}</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
