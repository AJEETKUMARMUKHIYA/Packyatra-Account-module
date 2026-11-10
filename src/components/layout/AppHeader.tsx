import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText,
  Bell
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { UserRole } from '../../types/accounting';

export const AppHeader: React.FC = () => {
  const { company, currentRole, setCurrentRole, bankAccounts, invoices, bills } = useAccounting();

  const totalBankLiquidity = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);
  const totalReceivables = invoices.filter(i => i.status === 'Posted' || i.status === 'PartiallyPaid').reduce((acc, i) => acc + i.balanceAmount, 0);
  const totalPayables = bills.filter(b => b.status === 'Posted').reduce((acc, b) => acc + b.balanceAmount, 0);

  const roles: UserRole[] = [
    'Company Admin',
    'Super Admin',
    'Accountant',
    'Finance Manager',
    'Auditor',
    'Employee',
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-5 py-3 sticky top-0 z-40 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Active Organization */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-tight text-white">{company.legalName}</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                GSTIN: {company.gstin}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Double-Entry Accounting Management System • Multi-Tenant Enterprise
            </p>
          </div>
        </div>

        {/* Financial Quick Ticker */}
        <div className="hidden xl:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Bank Liquidity:</span>
            <span className="font-mono font-bold text-emerald-400">
              ₹{totalBankLiquidity.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <ArrowDownLeft className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Receivables:</span>
            <span className="font-mono font-bold text-indigo-400">
              ₹{totalReceivables.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Payables:</span>
            <span className="font-mono font-bold text-rose-400">
              ₹{totalPayables.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Right Controls: Fiscal Year & Role Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>FY 2026-27</span>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 hidden sm:inline">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-white">
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
