import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  BookOpen, 
  Users, 
  Truck, 
  FileText, 
  CreditCard, 
  Receipt, 
  BadgePercent, 
  Scale, 
  FileSpreadsheet, 
  PieChart, 
  Landmark, 
  History, 
  Code2, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { ActiveNavSection } from '../../types/accounting';

interface NavGroup {
  label: string;
  items: {
    id: ActiveNavSection;
    label: string;
    icon: React.ReactNode;
    restrictedForEmployee?: boolean;
    badge?: string;
  }[];
}

export const AppSidebar: React.FC = () => {
  const { activeSection, setActiveSection, currentRole, invoices, bills } = useAccounting();
  const isEmployee = currentRole === 'Employee';

  const pendingInvoices = invoices.filter(i => i.status === 'Posted').length;
  const pendingBills = bills.filter(b => b.status === 'Posted').length;

  const navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Masters',
      items: [
        { id: 'company-profile', label: 'Company Profile', icon: <Building2 className="w-4 h-4" /> },
        { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: <BookOpen className="w-4 h-4" />, restrictedForEmployee: true },
        { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
        { id: 'vendors', label: 'Vendors', icon: <Truck className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Sales & Invoicing',
      items: [
        { id: 'sales-invoices', label: 'Sales Invoices', icon: <FileText className="w-4 h-4" />, badge: pendingInvoices > 0 ? `${pendingInvoices}` : undefined },
        { id: 'customer-receipts', label: 'Customer Receipts', icon: <CreditCard className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Purchases & Expenses',
      items: [
        { id: 'purchase-bills', label: 'Purchase Bills', icon: <Receipt className="w-4 h-4" />, badge: pendingBills > 0 ? `${pendingBills}` : undefined },
        { id: 'vendor-payments', label: 'Vendor Payments', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'expenses', label: 'Expenses Entry', icon: <BadgePercent className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Double-Entry Accounting',
      items: [
        { id: 'journal-entries', label: 'Journal Entries', icon: <Scale className="w-4 h-4" />, restrictedForEmployee: true },
        { id: 'general-ledger', label: 'General Ledger', icon: <FileSpreadsheet className="w-4 h-4" />, restrictedForEmployee: true },
      ],
    },
    {
      label: 'Financial Statements',
      items: [
        { id: 'trial-balance', label: 'Trial Balance', icon: <FileSpreadsheet className="w-4 h-4" />, restrictedForEmployee: true },
        { id: 'profit-loss', label: 'Profit & Loss (P&L)', icon: <PieChart className="w-4 h-4" />, restrictedForEmployee: true },
        { id: 'balance-sheet', label: 'Balance Sheet', icon: <Scale className="w-4 h-4" />, restrictedForEmployee: true },
        { id: 'ar-aging', label: 'AR & AP Aging', icon: <FileSpreadsheet className="w-4 h-4" />, restrictedForEmployee: true },
      ],
    },
    {
      label: 'Banking & Treasury',
      items: [
        { id: 'bank-accounts', label: 'Bank Accounts', icon: <Landmark className="w-4 h-4" />, restrictedForEmployee: true },
        { id: 'bank-reconciliation', label: 'Bank Reconciliation', icon: <Receipt className="w-4 h-4" />, restrictedForEmployee: true },
      ],
    },
    {
      label: 'Governance & Tech',
      items: [
        { id: 'audit-logs', label: 'Audit Trail Logs', icon: <History className="w-4 h-4" />, restrictedForEmployee: true },
        { id: 'backend-architecture', label: 'ASP.NET & SQL Specs', icon: <Code2 className="w-4 h-4 text-cyan-400" />, badge: '.NET 9' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-65px)]">
      <nav className="p-3 space-y-4 flex-1 overflow-y-auto max-h-[calc(100vh-120px)]">
        {navGroups.map((group) => {
          // If all items in this group are restricted for employee, hide group
          const visibleItems = group.items.filter(item => !isEmployee || !item.restrictedForEmployee);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
                {group.label}
              </div>

              {group.items.map((item) => {
                const isActive = activeSection === item.id;
                const isRestricted = item.restrictedForEmployee && isEmployee;

                if (isRestricted) return null;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Employee Role Notice if active */}
      {isEmployee && (
        <div className="m-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 leading-relaxed">
          <div className="font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Employee Role Active
          </div>
          <p className="mt-1 text-amber-200/80">
            Confidential financial statements, GL, and COA are restricted as required by accounting policies.
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between bg-slate-900/60">
        <span className="text-slate-500">Security Policy:</span>
        <span className="text-emerald-400 font-semibold font-mono">RBAC + Multi-Tenant</span>
      </div>
    </aside>
  );
};
