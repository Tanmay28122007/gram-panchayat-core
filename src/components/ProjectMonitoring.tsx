import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Clock, Trash2, Plus, Search, Hammer } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../LanguageContext';

export interface DevelopmentProject {
  id: string;
  name: string;
  estimatedCost: number;
  category: string;
  status: 'Ongoing' | 'Completed' | 'Postponed';
  createdAt: string;
  completedAt?: string;
}

interface ProjectMonitoringProps {
  role: 'sarpanch' | 'citizen';
}

export function ProjectMonitoring({ role }: ProjectMonitoringProps) {
  const { lang } = useLanguage();
  const [projects, setProjects] = useState<DevelopmentProject[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Sarpanch form state
  const [newName, setNewName] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newCategory, setNewCategory] = useState('Road & Infrastructure');

  const loadData = () => {
    const savedProjects = localStorage.getItem('village_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      // Mock data if empty
      const initial: DevelopmentProject[] = [
        {
          id: 'proj-1',
          name: 'Primary School Solar Panels',
          estimatedCost: 250000,
          category: 'Solar Energy',
          status: 'Ongoing',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'proj-2',
          name: 'Main Road Drainage Repair',
          estimatedCost: 150000,
          category: 'Drainage',
          status: 'Completed',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setProjects(initial);
      localStorage.setItem('village_projects', JSON.stringify(initial));
    }

    const savedExpenses = localStorage.getItem('sarpanch_expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  useEffect(() => {
    localStorage.setItem('village_projects', JSON.stringify(projects));
  }, [projects]);

  const categories = ['All', 'Road & Infrastructure', 'Water Supply', 'Solar Energy', 'Drainage', 'Education', 'Health'];

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const projectExpensesMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      const key = e.reason.toLowerCase();
      map[key] = (map[key] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCost) return;

    const newProject: DevelopmentProject = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: newName,
      estimatedCost: Number(newCost),
      category: newCategory,
      status: 'Ongoing',
      createdAt: new Date().toISOString()
    };

    setProjects([newProject, ...projects]);
    setNewName('');
    setNewCost('');
  };

  const handleStatusChange = (id: string, newStatus: DevelopmentProject['status']) => {
    setProjects(projects.map(p => 
      p.id === id ? { ...p, status: newStatus, completedAt: newStatus === 'Completed' ? new Date().toISOString() : p.completedAt } : p
    ));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const formatCurrency = (amt: number) => `₹ ${amt.toLocaleString('en-IN')}`;
  const formatDate = (isoStr: string) => new Date(isoStr).toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E1D3] pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold tracking-tight text-[#2C2C1E]">
            {role === 'sarpanch' ? 'Manage Development Projects' : 'Village Development Timeline'}
          </h2>
          <p className="text-[#8B8B7A] text-sm tracking-wide">
            {role === 'sarpanch' ? 'Add and update ongoing public works.' : 'Track the progress of ongoing and completed public works.'}
          </p>
        </div>
      </div>

      {role === 'sarpanch' && (
        <div className="bg-white p-6 rounded-[24px] border border-[#E6E1D3] shadow-sm">
          <h3 className="text-lg font-serif font-bold text-[#2C2C1E] mb-6 flex items-center gap-2">
            <Hammer className="w-5 h-5 text-[#5A5A40]" /> Add New Project
          </h3>
          <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Project Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Navapura Solar Panel Repair"
                className="w-full px-4 py-3 bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Cost (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-sm"
              >
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-4 mt-2">
              <button
                type="submit"
                className="py-3 px-6 bg-[#5A5A40] hover:bg-[#43432f] text-white rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap",
                filterCategory === c ? "bg-[#5A5A40] text-white" : "bg-white text-[#8B8B7A] border border-[#E6E1D3] hover:bg-[#F4F1EA]"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B7A]" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E6E1D3] rounded-full focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-sm"
          />
        </div>
      </div>

      {/* Project Projects List/Timeline */}
      <div className={cn("space-y-6", role === 'citizen' ? "relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E6E1D3] before:to-transparent" : "")}>
        <AnimatePresence>
          {filteredProjects.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-[24px] border border-[#E6E1D3] text-[#8B8B7A]">
              No development projects found in this category.
            </div>
          ) : (
            filteredProjects.map((project, idx) => {
              const spent = projectExpensesMap[project.name.toLowerCase()] || 0;
              const isOverBudget = spent > project.estimatedCost;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    layout: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                    y: { duration: 0.2 }
                  }}
                  key={project.id}
                  className={cn(
                    "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active",
                    role === 'citizen' ? "md:odd:flex-row-reverse" : "flex-col md:flex-row" // Citizen has timeline look, Sarpanch has list look
                  )}
                >
                  {role === 'citizen' && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#FDFBF7] bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                      {project.status === 'Completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  )}
                  
                  <div className={cn(
                    "bg-white p-6 rounded-[24px] shadow-sm w-full transition-shadow hover:shadow-md",
                    isOverBudget ? "border-2 border-red-500" : "border border-[#E6E1D3]",
                    role === 'citizen' ? "w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)]" : "w-full flex flex-col md:flex-row md:items-center justify-between gap-4"
                  )}>
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8B8B7A] bg-[#F4F1EA] px-2.5 py-1 rounded-full">
                            {project.category}
                          </span>
                          {isOverBudget && (
                            <span className="text-[10px] uppercase tracking-widest font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                              Budget Overrun Warning
                            </span>
                          )}
                        </div>
                        {role === 'citizen' && (
                          <span className={cn(
                            "text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full",
                            project.status === 'Completed' ? "text-green-700 bg-green-50" : 
                            project.status === 'Postponed' ? "text-orange-700 bg-orange-50" : 
                            "text-blue-700 bg-blue-50"
                          )}>
                            {project.status}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xl font-serif font-bold text-[#2C2C1E]">{project.name}</h4>
                        <div className="text-sm text-[#8B8B7A] mt-1 flex items-center gap-2">
                          <span>Started: {formatDate(project.createdAt)}</span>
                          {project.completedAt && (
                            <>
                              <span>•</span>
                              <span className="text-green-600">Finished: {formatDate(project.completedAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 mt-2">
                        <div className="font-mono text-sm">
                          <span className="text-[#8B8B7A] mr-2">Est. Cost:</span>
                          <span className="font-bold text-[#5A5A40]">{formatCurrency(project.estimatedCost)}</span>
                        </div>
                        {spent > 0 && (
                          <div className="font-mono text-sm">
                            <span className="text-[#8B8B7A] mr-2">Spent (Ledger):</span>
                            <span className="font-bold text-red-600">{formatCurrency(spent)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {role === 'sarpanch' && (
                      <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#E6E1D3] md:pl-6 mt-4 md:mt-0">
                        <div className="flex flex-col items-end gap-3">
                          <select
                            value={project.status}
                            onChange={(e) => handleStatusChange(project.id, e.target.value as DevelopmentProject['status'])}
                            className="px-4 py-2 bg-[#F4F1EA] border border-[#E6E1D3] rounded-full text-xs font-bold uppercase tracking-wider text-[#5A5A40] focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-center min-w-[120px] cursor-pointer"
                          >
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Postponed">Postponed</option>
                          </select>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="px-4 py-1.5 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider rounded-full transition-colors flex items-center gap-2 justify-center w-full"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
