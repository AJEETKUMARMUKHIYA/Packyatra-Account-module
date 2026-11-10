import React from 'react';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { AppHeader } from './components/layout/AppHeader';
import { AppSidebar } from './components/layout/AppSidebar';
import { DashboardView } from './components/modules/DashboardView';
import { CompanyProfileView } from './components/modules/CompanyProfileView';
import { ChartOfAccountsView } from './components/modules/ChartOfAccountsView';
import { CustomersView } from './components/modules/CustomersView';
import { VendorsView } from './components/modules/VendorsView';
import { SalesInvoicesView } from './components/modules/SalesInvoicesView';
import { PurchaseBillsView } from './components/modules/PurchaseBillsView';
import { ExpensesView } from './components/modules/ExpensesView';
import { JournalEntriesView } from './components/modules/JournalEntriesView';
import { GeneralLedgerView } from './components/modules/GeneralLedgerView';
import { FinancialReportsView } from './components/modules/FinancialReportsView';
import { BankingView } from './components/modules/BankingView';
import { AuditLogsView } from './components/modules/AuditLogsView';
import { BackendArchitectureView } from './components/modules/BackendArchitectureView';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeSection, toasts, dismissToast } = useAccounting();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header */}
      <AppHeader />

      {/* Main Body with Sidebar & Dynamic View */}
      <div className="flex-1 flex flex-col md:flex-row">
        <AppSidebar />

        <main className="flex-1 p-5 md:p-8 overflow-y-auto max-h-[calc(100vh-65px)] bg-slate-950">
          {activeSection === 'dashboard' && <DashboardView />}
          {activeSection === 'company-profile' && <CompanyProfileView />}
          {activeSection === 'chart-of-accounts' && <ChartOfAccountsView />}
          {activeSection === 'customers' && <CustomersView />}
          {activeSection === 'vendors' && <VendorsView />}
          {activeSection === 'sales-invoices' && <SalesInvoicesView />}
          {activeSection === 'customer-receipts' && <SalesInvoicesView />}
          {activeSection === 'purchase-bills' && <PurchaseBillsView />}
          {activeSection === 'vendor-payments' && <PurchaseBillsView />}
          {activeSection === 'expenses' && <ExpensesView />}
          {activeSection === 'journal-entries' && <JournalEntriesView />}
          {activeSection === 'general-ledger' && <GeneralLedgerView />}
          {activeSection === 'trial-balance' && <FinancialReportsView initialTab="trial-balance" />}
          {activeSection === 'profit-loss' && <FinancialReportsView initialTab="profit-loss" />}
          {activeSection === 'balance-sheet' && <FinancialReportsView initialTab="balance-sheet" />}
          {activeSection === 'ar-aging' && <FinancialReportsView initialTab="ar-aging" />}
          {activeSection === 'bank-accounts' && <BankingView />}
          {activeSection === 'bank-reconciliation' && <BankingView />}
          {activeSection === 'audit-logs' && <AuditLogsView />}
          {activeSection === 'backend-architecture' && <BackendArchitectureView />}
        </main>
      </div>

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl flex items-start gap-3 text-xs transition-all animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/40 text-rose-300'
                : 'bg-slate-900/95 border-indigo-500/40 text-indigo-300'
            }`}
          >
            <div className="pt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
            </div>

            <div className="flex-1">
              <div className="font-bold text-white text-xs">{toast.title}</div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.description}</p>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-500 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AccountingProvider>
      <MainContent />
    </AccountingProvider>
  );
}
