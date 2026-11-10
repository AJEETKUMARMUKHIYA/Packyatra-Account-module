import React from 'react';
import { 
  Layers, 
  ListChecks, 
  Database, 
  Code2, 
  Scale, 
  Terminal, 
  CheckCircle2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { NavigationTab, UserRole } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentRole }) => {
  const isEmployee = currentRole === 'Employee';

  const menuItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string; restrictedForEmployee?: boolean }[] = [
    {
      id: 'architecture',
      label: '1. Architecture & Layers',
      icon: <Layers className="w-4 h-4" />,
      badge: 'C4 Model',
    },
    {
      id: 'requirements',
      label: '2. Functional & NFRs',
      icon: <ListChecks className="w-4 h-4" />,
      badge: '18 Specs',
    },
    {
      id: 'database-schema',
      label: '3. SQL Server Schema',
      icon: <Database className="w-4 h-4" />,
      badge: '13 Tables',
    },
    {
      id: 'erd-diagram',
      label: '4. ERD & Cardinality',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      badge: 'Phase 2',
    },
    {
      id: 'ef-core',
      label: '5. EF Core Entities',
      icon: <Code2 className="w-4 h-4" />,
      badge: 'C# Models',
    },
    {
      id: 'fk-constraints',
      label: '6. Constraint Sandbox',
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      badge: 'Phase 2',
    },
    {
      id: 'simulator',
      label: '7. Double-Entry Engine',
      icon: <Scale className="w-4 h-4" />,
      badge: 'Simulator',
      restrictedForEmployee: true,
    },
    {
      id: 'cli-migrations',
      label: '8. CLI & Migrations',
      icon: <Terminal className="w-4 h-4" />,
      badge: 'dotnet CLI',
    },
    {
      id: 'checklist',
      label: '9. Verification Checklist',
      icon: <CheckCircle2 className="w-4 h-4" />,
      badge: 'Ready',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-65px)]">
      {/* Navigation section */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Phase 1 Deliverables
        </div>
      </div>

      <nav className="p-3 space-y-1.5 flex-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const isRestricted = item.restrictedForEmployee && isEmployee;

          return (
            <button
              key={item.id}
              disabled={isRestricted}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : isRestricted
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isRestricted ? (
                  <span title="Restricted for Employee role">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  </span>
                ) : item.badge ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
              </div>
            </button>
          );
        })}
      </nav>

      {/* Role Notice Card */}
      {isEmployee && (
        <div className="m-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 leading-relaxed">
          <p className="font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Employee Role Active
          </p>
          <p className="mt-1 text-amber-200/80">
            Confidential ledger and double-entry simulator are restricted as requested in Section 4.
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Backend Target:</span>
          <span className="font-mono text-emerald-400 font-semibold">.NET 9 / C# 13</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span>RDBMS:</span>
          <span className="font-mono text-indigo-400 font-semibold">SQL Server 2022</span>
        </div>
      </div>
    </aside>
  );
};
