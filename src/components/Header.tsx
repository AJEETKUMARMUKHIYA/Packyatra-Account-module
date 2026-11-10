import React from 'react';
import { Building2, ShieldCheck, Calendar, Database, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeCompany: string;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, setCurrentRole, activeCompany }) => {
  const roles: UserRole[] = [
    'Company Admin',
    'Super Admin',
    'Accountant',
    'Finance Manager',
    'Auditor',
    'Employee',
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-md">
      {/* Brand & System Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-indigo-500/20 shadow-lg">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-tight text-white">Startup Accounting Management System</h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Phase 1: Architecture & Design
            </span>
          </div>
          <p className="text-xs text-slate-400">Clean Architecture • ASP.NET Core Web API • SQL Server • Double-Entry Engine</p>
        </div>
      </div>

      {/* Right controls: Company & Role */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Company Selector */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Company:</span>
          <span className="font-semibold text-slate-200">{activeCompany}</span>
          <span className="text-slate-500 text-[10px] ml-1 bg-slate-700/60 px-1.5 py-0.5 rounded">INR (₹)</span>
        </div>

        {/* Fiscal Year */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>FY 2026-27 (Apr-Mar)</span>
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="bg-transparent text-amber-300 font-medium focus:outline-none cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="bg-slate-900 text-white">
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
