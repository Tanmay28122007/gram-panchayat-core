import React from 'react';
import { Issue } from '../types';
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function ComplaintTracker({ issues, user }: { issues: Issue[], user: any }) {
  const { t, lang } = useLanguage();
  
  const userIssues = issues.filter(i => i.reporterId === user.id);

  if (userIssues.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 mt-12 text-center">
        <h2 className="text-2xl font-serif font-bold text-[#2C2C1E] mb-4">Track My Complaints</h2>
        <div className="bg-white p-12 rounded-[24px] border border-[#E6E1D3] shadow-sm">
          <p className="text-[#8B8B7A] font-bold uppercase tracking-widest text-sm">No complaints found</p>
          <p className="text-[#5A5A40] mt-2">You haven't submitted any complaints yet.</p>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (issue: Issue) => {
    if (issue.status === 'resolved') {
      return { 
        label: 'Resolved', 
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: CheckCircle2,
        progress: 3
      };
    }
    if (issue.escalated) {
      return { 
        label: issue.escalatedTo || 'Slated to MP', 
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: ArrowUpRight,
        progress: 2
      };
    }
    if (issue.status === 'yellow') {
      return { 
        label: 'Under Review', 
        color: 'text-[#8B5A2B] bg-[#8B5A2B]/10 border-[#8B5A2B]/20',
        icon: Clock,
        progress: 1
      };
    }
    return {
      label: 'Pending',
      color: 'text-[#52796F] bg-[#52796F]/10 border-[#52796F]/20',
      icon: Clock,
      progress: 0
    };
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8 mt-4">
        <h2 className="text-3xl font-serif font-bold text-[#2C2C1E] tracking-tight">Track My Complaints</h2>
        <p className="text-[#8B8B7A] mt-2">Monitor the real-time status of your submissions.</p>
      </div>

      <div className="space-y-6">
        {userIssues.map((issue, idx) => {
          const statusInfo = getStatusDisplay(issue);
          const Icon = statusInfo.icon;
          
          return (
            <motion.div 
              key={issue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-[#E6E1D3] rounded-[24px] p-6 sm:p-8 shadow-sm flex flex-col gap-6"
            >
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#2C2C1E] mb-1">{issue.title}</h3>
                  <p className="text-sm text-[#5A5A40] mb-2 font-medium">Ticket ID: {issue.id}</p>
                  <p className="text-[#3D3D3D]">{issue.description}</p>
                </div>
                <div className={cn("px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest flex items-center gap-2", statusInfo.color)}>
                  <Icon className="w-4 h-4" />
                  {statusInfo.label}
                </div>
              </div>
              
              {/* Progress Timeline */}
              <div className="mt-4 border-t border-[#E6E1D3] pt-6 overflow-x-auto">
                <div className="min-w-[400px] flex items-center justify-between relative">
                  {/* Connecting Line */}
                  <div className="absolute left-8 right-8 top-4 h-0.5 bg-[#E6E1D3] -z-10" />
                  <div 
                    className="absolute left-8 top-4 h-0.5 bg-[#52796F] -z-10 transition-all duration-500"
                    style={{ width: `calc(${statusInfo.progress * 33.33}% - (${statusInfo.progress} * 16px))` }}
                  />

                  {/* Step 1: Pending */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", statusInfo.progress >= 0 ? "bg-[#52796F] text-white" : "bg-[#F4F1EA] text-[#8B8B7A]")}>
                      1
                    </div>
                    <span className={cn("text-xs font-bold uppercase tracking-widest", statusInfo.progress >= 0 ? "text-[#52796F]" : "text-[#8B8B7A]")}>Submitted</span>
                  </div>

                  {/* Step 2: Under Review */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", statusInfo.progress >= 1 ? "bg-[#52796F] text-white" : "bg-[#F4F1EA] text-[#8B8B7A]")}>
                      2
                    </div>
                    <span className={cn("text-xs font-bold uppercase tracking-widest", statusInfo.progress >= 1 ? "text-[#52796F]" : "text-[#8B8B7A]")}>Review</span>
                  </div>

                  {/* Step 3: Escalated / Handling */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", 
                      statusInfo.progress === 2 ? "bg-red-500 text-white" : 
                      statusInfo.progress > 2 ? "bg-[#52796F] text-white" : "bg-[#F4F1EA] text-[#8B8B7A]"
                    )}>
                      {statusInfo.progress === 2 ? <ArrowUpRight className="w-4 h-4" /> : "3"}
                    </div>
                    <span className={cn("text-xs font-bold uppercase tracking-widest", 
                      statusInfo.progress === 2 ? "text-red-500" :
                      statusInfo.progress > 2 ? "text-[#52796F]" : "text-[#8B8B7A]"
                    )}>
                      {statusInfo.progress === 2 ? 'Escalated' : 'Processing'}
                    </span>
                  </div>

                  {/* Step 4: Resolved */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", statusInfo.progress === 3 ? "bg-green-500 text-white" : "bg-[#F4F1EA] text-[#8B8B7A]")}>
                      <CheckCircle2 className="w-4 h-4" /> 
                    </div>
                    <span className={cn("text-xs font-bold uppercase tracking-widest", statusInfo.progress === 3 ? "text-green-600" : "text-[#8B8B7A]")}>Resolved</span>
                  </div>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
