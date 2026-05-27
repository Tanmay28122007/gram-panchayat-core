import React from 'react';
import { Issue } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Clock, MapPin, Map, ThumbsUp, ArrowUpRight, Users, X, ImageOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../LanguageContext';

interface SarpanchDashboardProps {
  issues: Issue[];
  onEscalate: (id: string, escalatedTo: string) => void;
  onResolve: (id: string) => void;
  onReview: (id: string) => void;
}

export function SarpanchDashboard({ issues, onEscalate, onResolve, onReview }: SarpanchDashboardProps) {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  
  const prevIssuesRef = React.useRef(issues);
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (issues.length > prevIssuesRef.current.length) {
      const prevIds = new Set(prevIssuesRef.current.map(i => i.id));
      const newIssue = issues.find(i => !prevIds.has(i.id));
      
      if (newIssue) {
        setHighlightedId(newIssue.id);
        const timer = setTimeout(() => setHighlightedId(null), 3000);
        
        // Also fire a Toast or small visual cue can be omitted if highlight is enough,
        // but we can play a small animation by setting highlightedId
      }
    }
    prevIssuesRef.current = issues;
  }, [issues]);

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
          <p className="text-[#8B8B7A] text-sm">{t.dashboardSub}</p>
        </div>
        <div className="flex gap-4 text-xs font-bold text-[#8B8B7A] uppercase tracking-wider">
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div>{t.overdue}</div>
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>{t.pending}</div>
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>{t.new}</div>
        </div>
      </div>

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
                <p className="text-[#3D3D3D] text-sm mt-1 mb-3">{issue.description}</p>
                {issue.issueImageUrl ? (
                  <div 
                    className="relative w-[100px] h-[100px] shrink-0 rounded-xl overflow-hidden border border-[#E6E1D3] cursor-pointer group shadow-sm bg-[#F4F1EA]"
                    onClick={() => setSelectedImage(issue.issueImageUrl!)}
                  >
                    <img src={issue.issueImageUrl} alt="Issue thumbnail" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  </div>
                ) : (
                  <div className="w-[100px] h-[100px] shrink-0 rounded-xl border border-dashed border-[#A3B18A]/50 bg-[#F4F1EA]/50 flex flex-col items-center justify-center text-[#8B8B7A]">
                    <ImageOff className="w-6 h-6 mb-1.5 opacity-50 text-[#5A5A40]" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-center leading-tight">No Image<br/>Attached</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-[#8B8B7A] flex-wrap uppercase tracking-wider mt-2">
                <div className="flex items-center gap-1.5 text-[#5A5A40]">
                  <Users className="w-4 h-4" /> {issue.reporter}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {issue.location}
                  {issue.coordinates?.lat && issue.coordinates?.lng && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${issue.coordinates.lat},${issue.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-[#F4F1EA] hover:bg-[#E6E1D3] text-[#5A5A40] px-2 py-0.5 rounded border border-[#E6E1D3] transition-colors ml-1 cursor-pointer"
                      title="Open in Google Maps"
                    >
                      <Map className="w-3 h-3" /> <span className="text-[10px]">Get Exact Location</span>
                    </a>
                  )}
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
                  {issue.status === 'green' && (
                    <button 
                      onClick={() => onReview(issue.id)}
                      className="flex-1 bg-[#F4F1EA] hover:bg-[#E6E1D3] text-[#8B5A2B] border border-[#E6E1D3] px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer text-center"
                    >
                      Under Review
                    </button>
                  )}
                  {!issue.escalated && (
                    <div className="flex-1 flex gap-2">
                       <button 
                        onClick={() => onEscalate(issue.id, 'Slated to MP')}
                        className="flex-1 bg-[#F4F1EA] hover:bg-red-50 text-red-600 border border-[#E6E1D3] px-2 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer text-center"
                      >
                        To MP
                      </button>
                      <button 
                        onClick={() => onEscalate(issue.id, 'Slated to MLA')}
                        className="flex-1 bg-[#F4F1EA] hover:bg-red-50 text-red-600 border border-[#E6E1D3] px-2 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer text-center"
                      >
                        To MLA
                      </button>
                    </div>
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
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm cursor-zoom-out"
          >
            <div className="relative max-w-5xl w-full h-full flex items-center justify-center pointer-events-none">
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2.5 text-white bg-black/30 hover:bg-black/60 rounded-full transition-all pointer-events-auto z-[210] cursor-pointer backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
              <motion.img 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                src={selectedImage} 
                alt="Maximized preview" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto cursor-default ring-1 ring-white/20"
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
