import React from 'react';
import { FinanceEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../LanguageContext';
import { cn } from '../lib/utils';

interface FinanceLedgerProps {
  entries: FinanceEntry[];
}

export function FinanceLedger({ entries }: FinanceLedgerProps) {
  const { t } = useLanguage();
  
  const totalAllocated = entries.filter(e => e.status === 'allocated').reduce((sum, e) => sum + e.amount, 0);
  const totalSpent = Math.abs(entries.filter(e => e.status === 'spent').reduce((sum, e) => sum + e.amount, 0));
  const remaining = totalAllocated - totalSpent;

  // Prepare chart data grouping by project for spent funds
  const spentByProjectMap = new Map<string, number>();
  entries.filter(e => e.status === 'spent').forEach(e => {
    spentByProjectMap.set(e.project, (spentByProjectMap.get(e.project) || 0) + Math.abs(e.amount));
  });

  const chartData = Array.from(spentByProjectMap.entries()).map(([name, value]) => ({
    name,
    spent: value
  }));

  const formatCurrency = (amt: number) => `₹ ${amt.toLocaleString('en-IN')}`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-serif font-bold tracking-tight text-[#2C2C1E]">{t.financeTitle}</h2>
        <p className="text-[#8B8B7A] text-sm tracking-wide">{t.financeSub}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="p-6 rounded-[24px] bg-white border border-[#E6E1D3] shadow-sm">
          <div className="flex items-center gap-2 text-[#8B8B7A] mb-2 text-[10px] font-bold uppercase tracking-wider">
            <ArrowDownRight className="w-4 h-4 text-green-600" /> {t.fundsAllocated}
          </div>
          <div className="text-3xl font-serif font-light text-[#2C2C1E]">{formatCurrency(totalAllocated)}</div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-[24px] bg-white border border-[#E6E1D3] shadow-sm">
          <div className="flex items-center gap-2 text-[#8B8B7A] mb-2 text-[10px] font-bold uppercase tracking-wider">
            <ArrowUpRight className="w-4 h-4 text-red-600" /> {t.totalExpenditure}
          </div>
          <div className="text-3xl font-serif font-light text-[#2C2C1E]">{formatCurrency(totalSpent)}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-[24px] bg-[#5A5A40] text-white shadow-lg">
          <div className="flex items-center gap-2 text-white/50 mb-2 text-[10px] font-bold uppercase tracking-wider">
            <Wallet className="w-4 h-4 text-white/50" /> {t.availableBalance}
          </div>
          <div className="text-3xl font-serif font-light text-white">{formatCurrency(remaining)}</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[24px] border border-[#E6E1D3] shadow-sm">
          <h3 className="text-lg font-serif font-bold text-[#2C2C1E] mb-6">{t.expenditureByProject}</h3>
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

        <div className="bg-white p-6 rounded-[24px] border border-[#E6E1D3] shadow-sm flex flex-col">
          <h3 className="text-lg font-serif font-bold text-[#2C2C1E] mb-4">{t.recentTransactions}</h3>
          <div className="flex-1 overflow-auto pr-2">
            <ul className="space-y-4">
              {entries.slice().reverse().map((entry) => (
                <li key={entry.id} className="flex justify-between items-center py-3 border-b border-[#E6E1D3] last:border-0">
                  <div>
                    <p className="font-bold text-[#2C2C1E] text-sm">{entry.project}</p>
                    <p className="text-[10px] uppercase font-bold text-[#8B8B7A] tracking-wider mt-1">{entry.category} • {entry.date}</p>
                  </div>
                  <div className={cn(
                    "font-bold text-right",
                    entry.status === 'allocated' ? "text-green-700" : "text-[#3D3D3D]"
                  )}>
                    {entry.status === 'allocated' ? '+' : '-'}{formatCurrency(Math.abs(entry.amount))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
