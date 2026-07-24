import React, { useEffect, useState } from 'react';
import { Issue } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Clock, MapPin, Map, ThumbsUp, ArrowUpRight, Users, X, ImageOff, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../LanguageContext';
import axios from 'axios';

interface SarpanchDashboardProps {
  issues: Issue[];
  onEscalate: (id: string, escalatedTo: string) => void;
  onResolve: (id: string) => void;
  onReview: (id: string) => void;
  onAddComment?: (issueId: string, text: string) => void;
}

export function SarpanchDashboard({ issues, onEscalate, onResolve, onReview, onAddComment }: SarpanchDashboardProps) {
  const { t } = useLanguage();
  const [selectedEvidence, setSelectedEvidence] = React.useState<{url: string, type: 'image'|'video'} | null>(null);
  
  const prevIssuesRef = React.useRef(issues);
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);
  const [aiGroups, setAiGroups] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  React.useEffect(() => {
    if (issues.length > prevIssuesRef.current.length) {
      const prevIds = new Set(prevIssuesRef.current.map(i => i.id));
      const newIssue = issues.find(i => !prevIds.has(i.id));
      
      if (newIssue) {
        setHighlightedId(newIssue.id);
        setTimeout(() => setHighlightedId(null), 3000);
      }
    }
    prevIssuesRef.current = issues;
  }, [issues]);

  React.useEffect(() => {
    const analyzeComplaints = async () => {
      try {
        const activeIssues = issues.filter(i => i.status !== 'resolved');
        if (activeIssues.length === 0) return;
        setIsAnalyzing(true);
        const res = await axios.post('/api/analyze-complaints', { issues: activeIssues });
        if (res.data.groups) {
          // Threshold of 3 for prototyping/testing
          const thresholdGroups = res.data.groups.filter((g: any) => g.issueIds.length >= 3);
          setAiGroups(thresholdGroups);
          
          // Automatically escalate issues that are part of a critical group
          thresholdGroups.forEach((group: any) => {
            group.issueIds.forEach((id: string) => {
              const issue = activeIssues.find(i => i.id === id);
              if (issue && !issue.escalated) {
                // Auto-escalate
                onEscalate(id, 'Panchayat Official (Auto-Escalated)');
              }
            });
          });
        }
      } catch (error: any) {
        console.error("Failed to analyze complaints", error.response?.data || error.message);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const timer = setTimeout(analyzeComplaints, 2000);
    return () => clearTimeout(timer);
  }, [issues, onEscalate]);

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
    // Red status ALWAYS at the top regardless of timestamp
    if (a.status === 'red' && b.status !== 'red') return -1;
    if (b.status === 'red' && a.status !== 'red') return 1;

    // For other statuses, Red -> Yellow -> Green -> Resolved
    const statusWeight = { red: 0, yellow: 1, green: 2, resolved: 3 };
    if (statusWeight[a.status] !== statusWeight[b.status]) {
      return statusWeight[a.status] - statusWeight[b.status];
    }
    
    // Then by date (newest first)
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-serif font-bold tracking-tight text-[#2C2C1E]">{t.dashboardTitle}</h2>
          <p className="text-[#8B8B7A] text-sm flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Real-time Live Sync Active
            {isAnalyzing && <span className="ml-2 flex items-center gap-1 text-[#52796F]"><Sparkles className="w-3 h-3 animate-pulse" /> AI Analyzing...</span>}
          </p>
        </div>
        <div className="flex gap-4 text-xs font-bold text-[#8B8B7A] uppercase tracking-wider">
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div>{t.overdue}</div>
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>{t.pending}</div>
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>{t.new}</div>
        </div>
      </div>

      {aiGroups.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-[#D46A43] flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5" /> AI Priority Alerts
          </h3>
          {aiGroups.map((group, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFF5F0] border-l-4 border-[#D46A43] p-5 rounded-r-2xl shadow-sm border-t border-b border-r border-[#E6E1D3]/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-[#2C2C1E] text-lg">{group.summary}</h4>
                  <div className="flex items-center gap-3 mt-2 text-sm text-[#D46A43] font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Critical Volume ({group.issueIds.length} Cases)</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {group.affectedLocations?.join(', ')}</span>
                  </div>
                  <p className="mt-3 text-[#3D3D3D] text-sm leading-relaxed">
                    <strong>Affected Citizens:</strong> {group.affectedCitizens?.join(', ')}
                  </p>
                </div>
                <div className="bg-[#D46A43] text-white px-3 py-1 text-xs font-bold uppercase rounded-md whitespace-nowrap shadow-sm">
                  Priority Escalated
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        <AnimatePresence>
          {sortedIssues.map((issue, index) => (
            <motion.div
              layout
              key={issue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              className={cn(
                "border rounded-[24px] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-500 flex flex-col md:flex-row gap-6 md:items-center justify-between",
                highlightedId === issue.id ? "bg-green-50 border-green-400 ring-2 ring-green-400 ring-opacity-50" : "bg-white border-[#E6E1D3]"
              )}
            >
              <div className="flex flex-col flex-1 w-full gap-4">
                {/* 1. Complaint Title & Ticket ID */}
                <div className="flex flex-col gap-1 mb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#8B8B7A] uppercase tracking-widest bg-[#F4F1EA] px-2 py-1 rounded inline-flex self-start border border-[#E6E1D3]">
                      Ticket ID: {(issue.ticketId || issue.id).startsWith('VDN-') ? (issue.ticketId || issue.id) : (issue.ticketId?.startsWith('TKT-') || issue.id.startsWith('TKT-') ? `VDN-${issue.ticketId || issue.id}` : `VDN-TKT-${issue.id.substring(0,6)}`)}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#2C2C1E] leading-tight break-words">{issue.title}</h3>
                </div>
                
                {/* 2. Complaint Description */}
                <p className="text-[#3D3D3D] text-base leading-relaxed">{issue.description}</p>
                
                {/* 4. Location Information (moved up) */}
                <div className="bg-[#F4F1EA] p-3 rounded-xl border border-[#E6E1D3] flex items-center justify-between mt-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#2C2C1E]">
                    <MapPin className="w-4 h-4 text-[#D46A43]" />
                    {issue.location} 
                  </div>
                  {issue.coordinates?.lat && issue.coordinates?.lng && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${issue.coordinates.lat},${issue.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-[#E6E1D3] text-[#5A5A40] px-3 py-1.5 rounded-lg border border-[#E6E1D3] transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider"
                      title="Open in Google Maps"
                    >
                      <Map className="w-3.5 h-3.5" /> Exact Location
                    </a>
                  )}
                </div>

                {/* 3. Attached Evidence */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[10px] font-bold text-[#8B8B7A] uppercase tracking-widest">Uploaded Evidence</span>
                  {(issue.attachments && issue.attachments.length > 0) || issue.issueImageUrl ? (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide shrink-0">
                      {issue.attachments ? issue.attachments.map((att, idx) => (
                        <div key={idx} className="relative w-fit shrink-0 flex flex-col gap-1">
                          <div className="relative w-[120px] h-[120px] rounded-xl overflow-hidden border border-[#E6E1D3] group shadow-sm bg-[#F4F1EA]">
                            {att.type === 'image' ? (
                              <div className="w-full h-full cursor-pointer" onClick={() => setSelectedEvidence({url: att.url, type: 'image'})}>
                                <img src={att.url} alt="Attachment" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                              </div>
                            ) : att.type === 'video' ? (
                              <div className="w-full h-full relative cursor-pointer" onClick={() => setSelectedEvidence({url: att.url, type: 'video'})}>
                                <video src={att.url} className="w-full h-full object-cover pointer-events-none" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                  <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center pl-1">
                                    <span className="text-xl leading-none">▶</span>
                                  </div>
                                </div>
                              </div>
                            ) : att.type === 'pdf' ? (
                              <div onClick={() => window.open(att.url, '_blank')} className="w-full h-full flex flex-col items-center justify-center p-2 text-[#5A5A40] hover:bg-[#E6E1D3] transition-colors cursor-pointer" title="Click to view PDF">
                                <span className="text-3xl mb-1 text-red-500">📄</span>
                                <span className="text-[9px] font-bold text-center w-full truncate">View PDF</span>
                              </div>
                            ) : (
                              <div onClick={() => window.open(att.url, '_blank')} className="w-full h-full flex flex-col items-center justify-center p-2 text-[#5A5A40] hover:bg-[#E6E1D3] transition-colors cursor-pointer">
                                <span className="text-2xl mb-1">📁</span>
                                <span className="text-[9px] font-bold text-center w-full truncate">{att.name}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col text-[#8B8B7A] px-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#5A5A40]">
                              {att.source === 'camera' ? '📷 Camera Capture' : '📁 Gallery Upload'}
                            </span>
                            {att.timestamp && <span className="text-[9px] font-mono">{new Date(att.timestamp).toLocaleTimeString()}</span>}
                          </div>
                        </div>
                      )) : issue.issueImageUrl && (
                        <div className="relative w-[120px] h-[120px] shrink-0 rounded-xl overflow-hidden border border-[#E6E1D3] cursor-pointer group shadow-sm bg-[#F4F1EA]" onClick={() => setSelectedEvidence({url: issue.issueImageUrl!, type: 'image'})}>
                          <img src={issue.issueImageUrl} alt="Issue thumbnail" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[#8B8B7A] italic py-2">No Evidence Uploaded by Citizen</div>
                  )}
                </div>

                {/* 5. System Metadata & Administrative Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mt-2 bg-white rounded-xl border border-[#E6E1D3] p-4 flex-wrap">
                  <div className="flex flex-col gap-3 flex-1 border-r border-[#E6E1D3] pr-4 sm:pr-0 sm:border-none">
                    <span className="text-[10px] font-bold text-[#8B8B7A] uppercase tracking-widest">Complaint Information</span>
                    <div className="flex items-center gap-3 flex-wrap">
                       <span className={cn("px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-widest flex items-center gap-1.5", getStatusColor(issue.status))}>
                        {issue.status === 'red' && <AlertCircle className="w-3.5 h-3.5" /> }
                        {issue.status === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5" /> }
                        {getStatusLabel(issue.status)}
                      </span>
                      <span className="text-[10px] text-[#8B8B7A] font-bold tracking-widest uppercase flex items-center gap-1">
                         <Clock className="w-3.5 h-3.5" /> {new Date(issue.reportedAt).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-[#D46A43] font-bold tracking-widest uppercase flex items-center gap-1 bg-white border rounded px-1.5 py-0.5">
                         <ThumbsUp className="w-3 h-3 text-[#D46A43]" /> {issue.upvotes} {t.upvotes}
                      </span>
                      {issue.escalated && (
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-widest bg-[#D46A43]/10 text-[#D46A43] border-[#D46A43]/20 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" /> {issue.escalatedTo ? `To ${issue.escalatedTo}` : t.escalated}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions right beside metadata */}
                  <div className="flex flex-col gap-2 pt-2 sm:pt-0 sm:pl-4 sm:border-l sm:border-[#E6E1D3] justify-center">
                    {issue.status !== 'resolved' && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => onResolve(issue.id)}
                          className="bg-[#5A5A40] hover:bg-[#2C2C1E] text-white px-4 py-2 rounded-lg text-xs uppercase font-bold tracking-widest transition-colors cursor-pointer border border-transparent whitespace-nowrap"
                        >
                          {t.markResolved}
                        </button>
                        {issue.status === 'green' && (
                          <button 
                            onClick={() => onReview(issue.id)}
                            className="bg-[#F4F1EA] hover:bg-[#E6E1D3] text-[#8B5A2B] border border-[#E6E1D3] px-4 py-2 rounded-lg text-xs uppercase font-bold tracking-widest transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Review
                          </button>
                        )}
                        {!issue.escalated && (
                          <>
                            <button 
                              onClick={() => onEscalate(issue.id, 'Slated to MP')}
                              className="bg-[#FFF5F0] hover:bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs uppercase font-bold tracking-widest transition-colors cursor-pointer whitespace-nowrap"
                            >
                              To MP
                            </button>
                            <button 
                              onClick={() => onEscalate(issue.id, 'Slated to MLA')}
                              className="bg-[#FFF5F0] hover:bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs uppercase font-bold tracking-widest transition-colors cursor-pointer whitespace-nowrap"
                            >
                              To MLA
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {issue.status === 'resolved' && (
                       <div className="flex items-center gap-3">
                         <span className="text-[10px] uppercase font-bold text-[#8B8B7A] tracking-widest">Proof of Fix:</span>
                         {issue.proofImageUrl ? (
                            <img src={issue.proofImageUrl} alt="Proof" className="w-10 h-10 rounded object-cover border border-[#E6E1D3]" />
                          ) : (
                            <span className="text-xs text-green-700 font-bold px-2 py-1 bg-green-50 rounded border border-green-200">Verified</span>
                          )}
                       </div>
                    )}
                  </div>
                </div>

                {/* 6. Citizen Information */}
                {issue.reporter && issue.reporter !== 'Anonymous' && issue.reporter !== 'Anonymous Citizen' && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-[#E6E1D3] flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-[#5A5A40]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#2C2C1E]">{issue.reporter}</span>
                      <span className="text-[10px] uppercase tracking-widest text-[#8B8B7A] font-medium">Citizen / Reporter</span>
                    </div>
                  </div>
                )}
                
                {/* 7. Official Updates Timeline */}
                <div className="w-full mt-4 pt-4 border-t border-[#E6E1D3]">
                  {/* ... timeline ... */}
                  {issue.comments && issue.comments.length > 0 && (
                    <div className="flex flex-col gap-3 mb-4">
                      <h4 className="text-[10px] font-bold text-[#8B8B7A] uppercase tracking-widest mb-1 shadow-sm px-3 py-1 bg-[#F4F1EA] rounded-full self-start inline-flex border border-[#E6E1D3]">Official Updates Timeline</h4>
                      {issue.comments.map(c => (
                        <div key={c.id} className={cn("p-4 text-sm rounded-xl border max-w-[90%]", c.role === 'official' ? "bg-blue-50/50 border-blue-100 self-end" : "bg-[#F4F1EA] border-[#E6E1D3] self-start")}>
                          <div className="flex justify-between items-center mb-1.5 gap-4">
                            <div className="font-bold text-[#2C2C1E] text-xs uppercase tracking-wide flex items-center gap-1.5">
                              {c.role === 'official' && <ShieldAlert className="w-3.5 h-3.5 text-blue-600 mb-0.5" />} {c.author}
                            </div>
                            <span className="text-[10px] text-[#8B8B7A] font-mono tracking-tighter">
                              {new Date(c.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[#3D3D3D] leading-relaxed">{c.text}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 8. Send Official Update */}
                  {issue.status !== 'resolved' && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const input = form.elements.namedItem('comment') as HTMLInputElement;
                        const text = input.value.trim();
                        if (text && onAddComment) {
                          onAddComment(issue.id, text);
                          form.reset();
                        }
                      }}
                      className="flex gap-2 w-full sm:w-[80%] mx-auto mt-2"
                    >
                      <input 
                        type="text" 
                        name="comment"
                        placeholder="Type an official update/response to the citizen here..."
                        className="flex-1 bg-[#FDFBF7] border border-[#E6E1D3] text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40]/30 transition-all font-medium"
                        required
                      />
                      <button type="submit" className="shrink-0 px-6 rounded-xl bg-[#2C2C1E] text-white hover:bg-[#5A5A40] transition-colors font-bold uppercase tracking-widest text-xs shadow-md">
                        Send Update
                      </button>
                    </form>
                  )}
                </div>
              </div>
          </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedEvidence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvidence(null)}
            className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm cursor-zoom-out"
          >
            <div className="relative max-w-5xl w-full h-full flex items-center justify-center pointer-events-none">
              <button 
                onClick={() => setSelectedEvidence(null)}
                className="absolute top-4 right-4 p-2.5 text-white bg-black/30 hover:bg-black/60 rounded-full transition-all pointer-events-auto z-[210] cursor-pointer backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
              {selectedEvidence.type === 'image' ? (
                <motion.img 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  src={selectedEvidence.url} 
                  alt="Maximized preview" 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto cursor-default ring-1 ring-white/20"
                  onClick={(e) => e.stopPropagation()} 
                />
              ) : (
                <motion.video 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  src={selectedEvidence.url} 
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto cursor-default ring-1 ring-white/20 bg-black"
                  onClick={(e) => e.stopPropagation()} 
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
