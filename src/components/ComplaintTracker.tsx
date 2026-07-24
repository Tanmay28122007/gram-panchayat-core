import React from 'react';
import { Issue } from '../types';
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function ComplaintTracker({ issues, user, onAddComment }: { issues: Issue[], user: any, onAddComment?: (issueId: string, text: string, files?: File[]) => void }) {
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
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#8B8B7A] uppercase tracking-widest bg-[#F4F1EA] px-2 py-1 rounded border border-[#E6E1D3] inline-block">
                      Ticket ID: {(issue.ticketId || issue.id).startsWith('VDN-') ? (issue.ticketId || issue.id) : (issue.ticketId?.startsWith('TKT-') || issue.id.startsWith('TKT-') ? `VDN-${issue.ticketId || issue.id}` : `VDN-TKT-${issue.id.substring(0,6)}`)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#2C2C1E] mb-2">{issue.title}</h3>
                  <p className="text-[#3D3D3D]">{issue.description}</p>
                  {issue.attachments && issue.attachments.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 mt-3 scrollbar-hide">
                      {issue.attachments.map((att, idx) => (
                        <div key={idx} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-[#E6E1D3] shadow-sm bg-[#F4F1EA]">
                          {att.type === 'image' ? (
                            <img src={att.url} alt="Attachment" className="w-full h-full object-cover" />
                          ) : (
                            <div onClick={() => window.open(att.url, '_blank')} className="w-full h-full flex flex-col items-center justify-center p-1 text-[#5A5A40] hover:bg-[#E6E1D3] transition-colors cursor-pointer">
                              <span className="text-lg leading-none mb-0.5">{att.type === 'pdf' ? '📄' : att.type === 'video' ? '🎥' : '📁'}</span>
                              <span className="text-[7px] font-bold text-center w-full truncate leading-tight">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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

              {/* Updates & Interaction */}
              <div className="mt-4 border-t border-[#E6E1D3] pt-6 flex flex-col gap-4">
                {issue.comments && issue.comments.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-bold text-[#2C2C1E] uppercase tracking-wider">Updates & Comments</h4>
                    {issue.comments.map(c => (
                      <div key={c.id} className={cn("p-3 rounded-xl border text-sm max-w-[85%]", c.role === 'citizen' ? "bg-white border-[#E6E1D3] self-end" : "bg-[#F4F1EA] border-[#A3B18A]/30 self-start")}>
                         <div className="flex justify-between items-end mb-1">
                           <span className="font-bold text-[#5A5A40] text-xs">{c.author}</span>
                           <span className="text-[10px] text-[#8B8B7A] ml-4">{new Date(c.timestamp).toLocaleTimeString()}</span>
                         </div>
                         <p className="text-[#3D3D3D]">{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {issue.status !== 'resolved' && (
                  <form onSubmit={(e) => {
                     e.preventDefault();
                     const form = e.target as HTMLFormElement;
                     const text = (form.elements.namedItem('comment') as HTMLInputElement).value;
                     const fileInput = form.elements.namedItem('files') as HTMLInputElement;
                     const files = fileInput.files ? Array.from(fileInput.files) : undefined;
                     if (text.trim() && onAddComment) {
                       onAddComment(issue.id, text.trim(), files);
                       form.reset();
                     }
                  }} className="flex flex-col gap-2 relative mt-2 pt-4 border-t border-dashed border-[#E6E1D3]">
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         name="comment" 
                         placeholder="Add an update or comment..." 
                         required
                         className="flex-1 bg-[#FDFBF7] border border-[#E6E1D3] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#5A5A40]"
                       />
                       <label className="shrink-0 cursor-pointer w-10 h-10 rounded-full border border-[#E6E1D3] bg-white flex items-center justify-center hover:bg-[#F4F1EA] text-[#8B8B7A] transition-colors" title="Attach Files">
                         <span className="text-lg leading-none">+</span>
                         <input type="file" name="files" multiple accept="image/*,video/*,application/pdf" className="hidden" />
                       </label>
                       <button type="submit" className="shrink-0 w-10 h-10 rounded-full bg-[#52796F] text-white flex items-center justify-center hover:bg-[#3D5A52] transition-colors">
                         <div className="w-4 h-4 bg-white" style={{ maskImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22currentColor%22><path d=%22M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z%22/></svg>')", WebkitMaskImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22currentColor%22><path d=%22M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z%22/></svg>')", WebkitMaskSize: "cover", WebkitMaskPosition: "center" }} />
                       </button>
                    </div>
                  </form>
                )}
              </div>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
