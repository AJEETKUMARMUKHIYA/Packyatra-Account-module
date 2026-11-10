import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileText, 
  Receipt, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Scale
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

export const DashboardView: React.FC = () => {
  const { 
    company, 
    invoices, 
    bills, 
    bankAccounts, 
    journalEntries, 
    getProfitAndLoss, 
    setActiveSection,
    postSalesInvoice
  } = useAccounting();

  const { revenueTotal, expensesTotal, netProfit } = getProfitAndLoss();
  const bankLiquidity = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);

  const pendingInvoices = invoices.filter(i => i.status === 'Posted' || i.status === 'PartiallyPaid');
  const totalReceivables = pendingInvoices.reduce((acc, i) => acc + i.balanceAmount, 0);

  const pendingBills = bills.filter(b => b.status === 'Posted');
  const totalPayables = pendingBills.reduce((acc, b) => acc + b.balanceAmount, 0);

  const recentJournals = [...journalEntries]
    .filter(j => j.status === 'Posted')
    .slice(0, 6);

  const draftInvoices = invoices.filter(i => i.status === 'Draft');

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome & Quick Action Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-700/60 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Financial Operations Overview
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">{company.legalName}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Accounting Period: FY 2026-27 (Apr 2026 – Mar 2027) • Base Currency: {company.currencyCode} ({company.currencySymbol})
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSection('sales-invoices')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> New Sales Invoice
          </button>
          <button
            onClick={() => setActiveSection('purchase-bills')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Receipt className="w-4 h-4 text-emerald-400" /> Enter Vendor Bill
          </button>
          <button
            onClick={() => setActiveSection('expenses')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-rose-400" /> Record Expense
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Operating Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono text-emerald-400">
              ₹{revenueTotal.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Posted sales & consulting</div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono text-rose-400">
              ₹{expensesTotal.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Bills & direct OPEX</div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Net Profit / (Loss)</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-xl font-bold font-mono ${netProfit >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              ₹{netProfit.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Net margin: {revenueTotal > 0 ? ((netProfit / revenueTotal) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Cash & Bank Balances */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Bank & Cash Liquidity</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono text-cyan-300">
              ₹{bankLiquidity.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{bankAccounts.length} company bank accounts</div>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Receivables (AR)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono text-amber-300">
              ₹{totalReceivables.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{pendingInvoices.length} outstanding invoices</div>
          </div>
        </div>

        {/* Outstanding Payables */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Payables (AP)</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono text-purple-300">
              ₹{totalPayables.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{pendingBills.length} unpaid vendor bills</div>
          </div>
        </div>
      </div>

      {/* Draft Invoices Quick Alert if any */}
      {draftInvoices.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">{draftInvoices.length} Draft Sales Invoice(s) waiting to be posted.</span>
              <p className="text-amber-200/80 text-[11px]">Draft invoices do not affect the general ledger until posted.</p>
            </div>
          </div>

          <button
            onClick={() => setActiveSection('sales-invoices')}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
          >
            Review & Post Invoices <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Two Column Area: Financial Statement Summary & Recent Posted Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Revenue & Profit Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> Revenue & Expense Distribution
              </h3>
              <button
                onClick={() => setActiveSection('profit-loss')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                Full P&L <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Income vs Expense Visual Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>Revenue: ₹{revenueTotal.toLocaleString('en-IN')}</span>
                <span>Expenses: ₹{expensesTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{
                    width: `${revenueTotal + expensesTotal > 0 ? (revenueTotal / (revenueTotal + expensesTotal)) * 100 : 50}%`,
                  }}
                  title="Revenue Share"
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{
                    width: `${revenueTotal + expensesTotal > 0 ? (expensesTotal / (revenueTotal + expensesTotal)) * 100 : 50}%`,
                  }}
                  title="Expenses Share"
                />
              </div>
            </div>

            {/* Bank Accounts Ticker */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Bank Liquidity Accounts
              </div>
              <div className="space-y-2">
                {bankAccounts.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-800/60 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{b.bankName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">A/C: ••••{b.accountNumber.slice(-4)}</div>
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-400">
                      ₹{b.currentBalance.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Authoritative Double-Entry Ledger Transactions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" /> Recent General Ledger Activity
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Authoritative double-entry journals posted in real-time.
                </p>
              </div>

              <button
                onClick={() => setActiveSection('journal-entries')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                View All ({journalEntries.length}) <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentJournals.map((j) => (
                <div
                  key={j.id}
                  className="p-3 bg-slate-800/50 hover:bg-slate-800/80 rounded-xl border border-slate-800 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-400 text-[11px]">{j.journalNumber}</span>
                      <span className="text-[10px] font-semibold bg-slate-700/80 text-slate-300 px-1.5 py-0.5 rounded">
                        {j.sourceType}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{j.transactionDate}</span>
                    </div>
                    <div className="text-slate-300 font-medium line-clamp-1">{j.description}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-emerald-400">
                      ₹{j.totalDebit.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Balanced
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
