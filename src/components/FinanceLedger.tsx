import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Wallet, Plus, Trash2, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../LanguageContext';
import { cn } from '../lib/utils';

interface ExpenseEntry {
  id: string;
  reason: string;
  amount: number;
  category: string;
  date: string;
  isFinalPayment?: boolean;
}

export function FinanceLedger() {
  const { t, lang } = useLanguage();
  
  // State
  const [totalFund, setTotalFund] = useState<number>(5000000);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [newReason, setNewReason] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Road');
  const [isFinalPayment, setIsFinalPayment] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const savedFund = localStorage.getItem('sarpanch_total_fund');
    const savedExpenses = localStorage.getItem('sarpanch_expenses');
    if (savedFund) setTotalFund(Number(savedFund));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('sarpanch_total_fund', totalFund.toString());
    localStorage.setItem('sarpanch_expenses', JSON.stringify(expenses));
  }, [totalFund, expenses]);

  // Derived State
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalFund - totalSpent;
  const isWarning = totalFund > 0 && remaining < totalFund * 0.10;

  // Handlers
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason || !newAmount) return;
    
    const expense: ExpenseEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      reason: newReason,
      amount: Number(newAmount),
      category: newCategory,
      date: new Date().toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-IN'),
      isFinalPayment: isFinalPayment
    };
    
    setExpenses([expense, ...expenses]);

    // Auto-sync with Development Projects
    const savedProjects = localStorage.getItem('village_projects');
    const projects: any[] = savedProjects ? JSON.parse(savedProjects) : [];
    const existingProjectIndex = projects.findIndex((p: any) => p.name.toLowerCase() === newReason.trim().toLowerCase());
    
    if (existingProjectIndex === -1) {
      // Create new project if it doesn't exist
      const newProj = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + '-proj',
        name: newReason.trim(),
        estimatedCost: Number(newAmount), // Default estimated cost to this first expense
        category: newCategory,
        status: isFinalPayment ? 'Completed' : 'Ongoing',
        createdAt: new Date().toISOString(),
        ...(isFinalPayment ? { completedAt: new Date().toISOString() } : {})
      };
      projects.unshift(newProj);
    } else {
      // If it exists, update its status
      if (isFinalPayment) {
        projects[existingProjectIndex].status = 'Completed';
        projects[existingProjectIndex].completedAt = new Date().toISOString();
      }
    }
    
    localStorage.setItem('village_projects', JSON.stringify(projects));
    window.dispatchEvent(new Event('storage')); // trigger updates in other tabs/components

    setNewReason('');
    setNewAmount('');
    setIsFinalPayment(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const handleUpdateFund = () => {
    const newVal = window.prompt('Enter new Total Allocated Fund:', totalFund.toString());
    if (newVal !== null && !isNaN(Number(newVal))) {
      setTotalFund(Number(newVal));
    }
  };

  // Chart Data
  const spentByProjectMap = new Map<string, number>();
  expenses.forEach(e => {
    spentByProjectMap.set(e.category, (spentByProjectMap.get(e.category) || 0) + e.amount);
  });

  const chartData = Array.from(spentByProjectMap.entries()).map(([name, value]) => ({
    name,
    spent: value
  }));

  const formatCurrency = (amt: number) => `₹ ${amt.toLocaleString('en-IN')}`;

  const filteredExpenses = expenses.filter(e => e.reason.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E1D3] pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold tracking-tight text-[#2C2C1E]">Village Open Ledger</h2>
          <p className="text-[#8B8B7A] text-sm tracking-wide">Manage public funds & track developmental expenses</p>
        </div>
        <button
          onClick={handleUpdateFund}
          className="px-4 py-2 bg-[#F4F1EA] border border-[#E6E1D3] rounded-full text-sm font-bold text-[#5A5A40] hover:bg-[#E6E1D3] transition-colors"
        >
          Update Total Fund
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="p-6 rounded-[24px] bg-white border border-[#E6E1D3] shadow-sm">
          <div className="flex items-center gap-2 text-[#8B8B7A] mb-2 text-[10px] font-bold uppercase tracking-wider">
            <ArrowDownRight className="w-4 h-4 text-green-600" /> Total Budget
          </div>
          <div className="text-3xl font-serif font-light text-[#2C2C1E]">{formatCurrency(totalFund)}</div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-[24px] bg-white border border-[#E6E1D3] shadow-sm">
          <div className="flex items-center gap-2 text-[#8B8B7A] mb-2 text-[10px] font-bold uppercase tracking-wider">
            <ArrowUpRight className="w-4 h-4 text-red-600" /> Total Spent
          </div>
          <div className="text-3xl font-serif font-light text-[#2C2C1E]">{formatCurrency(totalSpent)}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
          className={cn(
            "p-6 rounded-[24px] shadow-lg transition-colors duration-300",
            isWarning ? "bg-red-600 text-white animate-pulse" : "bg-[#5A5A40] text-white"
          )}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-white/70 mb-2 text-[10px] font-bold uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-white/70" /> Remaining Balance
            </div>
            {isWarning && <AlertCircle className="w-5 h-5 text-white/80" />}
          </div>
          <div className="text-3xl font-serif font-light text-white">{formatCurrency(remaining)}</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Add Expense Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[24px] border border-[#E6E1D3] shadow-sm flex flex-col">
          <h3 className="text-lg font-serif font-bold text-[#2C2C1E] mb-6">Record Expense</h3>
          <form onSubmit={handleAddExpense} className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Item / Reason</label>
              <input
                type="text"
                required
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="e.g. Primary School Roof Repair"
                className="w-full px-4 py-3 bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
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
                <option value="Road">Road & Infrastructure</option>
                <option value="Water">Water Supply</option>
                <option value="Education">Education</option>
                <option value="Medical">Medical & Health</option>
                <option value="Electricity">Electricity</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="finalPayment"
                checked={isFinalPayment}
                onChange={(e) => setIsFinalPayment(e.target.checked)}
                className="w-4 h-4 text-[#52796F] border-[#E6E1D3] rounded focus:ring-[#52796F]"
              />
              <label htmlFor="finalPayment" className="text-sm font-medium text-[#3D3D3D]">
                Mark as Final Payment
              </label>
            </div>
            <div className="mt-auto pt-4">
              <button
                type="submit"
                className="w-full py-3 bg-[#52796F] hover:bg-[#43635a] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Expense
              </button>
            </div>
          </form>
        </div>

        {/* Ledger Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-[#E6E1D3] shadow-sm flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
             <h3 className="text-lg font-serif font-bold text-[#2C2C1E]">Expense Ledger</h3>
             <div className="relative w-full sm:w-64">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B7A]" />
               <input 
                 type="text" 
                 placeholder="Search expenses..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-[#F4F1EA] border border-[#E6E1D3] rounded-full focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-sm"
               />
             </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[500px]">
               <thead>
                 <tr className="bg-[#FDFBF7] text-[#8B8B7A] text-[10px] uppercase tracking-wider border-b border-[#E6E1D3]">
                   <th className="p-4 font-bold">Date</th>
                   <th className="p-4 font-bold max-w-[200px]">Reason</th>
                   <th className="p-4 font-bold">Category</th>
                   <th className="p-4 font-bold text-right">Amount</th>
                   <th className="p-4 font-bold text-center">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#E6E1D3]/50">
                 <AnimatePresence>
                   {filteredExpenses.length === 0 ? (
                     <tr>
                       <td colSpan={5} className="p-8 text-center text-[#8B8B7A] text-sm">
                         No expenses found.
                       </td>
                     </tr>
                   ) : (
                     filteredExpenses.map((entry) => (
                       <motion.tr 
                         key={entry.id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, x: -10 }}
                         className="hover:bg-[#FDFBF7] transition-colors group"
                       >
                         <td className="p-4 text-xs text-[#8B8B7A] whitespace-nowrap">{entry.date}</td>
                         <td className="p-4">
                           <div className="font-bold text-sm text-[#2C2C1E] line-clamp-2">{entry.reason}</div>
                         </td>
                         <td className="p-4">
                           <span className="bg-[#F4F1EA] text-[#5A5A40] text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                             {entry.category}
                           </span>
                         </td>
                         <td className="p-4 text-right">
                           <div className="font-mono text-sm font-bold text-red-600 whitespace-nowrap">
                             - {formatCurrency(Math.abs(entry.amount))}
                           </div>
                         </td>
                         <td className="p-4 text-center align-middle">
                            <button 
                              onClick={() => handleDelete(entry.id)}
                              className="p-1.5 text-[#8B8B7A] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                              title="Delete entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </td>
                       </motion.tr>
                     ))
                   )}
                 </AnimatePresence>
               </tbody>
             </table>
          </div>
        </div>
      </div>
      
      {/* Visual Chart below */}
      {expenses.length > 0 && (
         <div className="bg-white p-6 rounded-[24px] border border-[#E6E1D3] shadow-sm">
           <h3 className="text-lg font-serif font-bold text-[#2C2C1E] mb-6">Expenditure by Category</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 0, right: 0, left: 10, bottom: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                 <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 12, fill: '#6b7280' }} 
                   dy={10} 
                 />
                 <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 12, fill: '#6b7280' }} 
                   tickFormatter={(val) => `₹${val/1000}k`} 
                 />
                 <Tooltip 
                   cursor={{ fill: '#f3f4f6' }} 
                   contentStyle={{ borderRadius: '12px', borderColor: '#E6E1D3', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                   formatter={(val: number) => formatCurrency(val)} 
                 />
                 <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                   {
                     chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill="#A3B18A" />
                     ))
                   }
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
         </div>
      )}
    </div>
  );
}
