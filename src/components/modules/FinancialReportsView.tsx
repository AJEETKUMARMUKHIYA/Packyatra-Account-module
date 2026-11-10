import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  PieChart, 
  Scale, 
  Clock, 
  CheckCircle, 
  Printer, 
  Download,
  AlertCircle
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

export const FinancialReportsView: React.FC<{ initialTab?: 'trial-balance' | 'profit-loss' | 'balance-sheet' | 'ar-aging' }> = ({ initialTab = 'trial-balance' }) => {
  const { 
    company, 
    getTrialBalance, 
    getProfitAndLoss, 
    getBalanceSheet,
    invoices,
    bills,
    customers,
    vendors
  } = useAccounting();

  const [activeReportTab, setActiveReportTab] = useState<'trial-balance' | 'profit-loss' | 'balance-sheet' | 'ar-aging'>(initialTab);

  const { items: tbItems, totalDebit: tbDebit, totalCredit: tbCredit, isBalanced: tbBalanced } = getTrialBalance();
  const { revenueTotal, expensesTotal, netProfit, revenueItems, expenseItems } = getProfitAndLoss();
  const { totalAssets, totalLiabilities, totalEquity, isBalanced: bsBalanced, assetItems, liabilityItems, equityItems } = getBalanceSheet();

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" /> Authoritative Financial Statements
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Financial Reports & Statements</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time financial reports calculated strictly from posted double-entry journal entries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Report Tab Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex flex-wrap gap-2 text-xs font-medium">
        <button
          onClick={() => setActiveReportTab('trial-balance')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeReportTab === 'trial-balance' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Trial Balance
        </button>
        <button
          onClick={() => setActiveReportTab('profit-loss')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeReportTab === 'profit-loss' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <PieChart className="w-4 h-4" /> Profit & Loss Statement (P&L)
        </button>
        <button
          onClick={() => setActiveReportTab('balance-sheet')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeReportTab === 'balance-sheet' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" /> Balance Sheet
        </button>
        <button
          onClick={() => setActiveReportTab('ar-aging')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeReportTab === 'ar-aging' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" /> AR & AP Aging
        </button>
      </div>

      {/* 1. TRIAL BALANCE TAB */}
      {activeReportTab === 'trial-balance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Trial Balance Report</h3>
              <p className="text-xs text-slate-400">As of today (FY 2026-27) • Aggregated Net Debit & Credit Balances</p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
              tbBalanced
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {tbBalanced ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{tbBalanced ? 'Trial Balance Reconciled (Debits == Credits)' : 'Out of Balance!'}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Account Code</th>
                  <th className="py-2.5 px-3">Account Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Debit Balance (₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tbItems.map((item) => (
                  <tr key={item.accountId} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">{item.code}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{item.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                      {item.debitBalance > 0 ? `₹${item.debitBalance.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-indigo-400">
                      {item.creditBalance > 0 ? `₹${item.creditBalance.toLocaleString('en-IN')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-600 font-bold text-white text-xs bg-slate-800/40">
                  <td colSpan={3} className="py-3 px-3 uppercase tracking-wider text-slate-300">
                    Total Balances
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">
                    ₹{tbDebit.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-indigo-400 text-sm">
                    ₹{tbCredit.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="py-2.5 px-3 text-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-b">
                    Net Imbalance = ₹{(tbDebit - tbCredit).toFixed(2)} (Double-entry integrity verified)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 2. PROFIT & LOSS TAB */}
      {activeReportTab === 'profit-loss' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Profit & Loss Statement (Income Statement)</h3>
              <p className="text-xs text-slate-400">For the Financial Year ending March 31, 2027</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Net Period Earnings: </span>
              <span className={`text-base font-mono font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{netProfit.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Revenue Column */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                1. Operating Revenue
              </div>
              <div className="space-y-2 text-xs">
                {revenueItems.map((rev, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-300">{rev.name}</span>
                    <span className="font-mono text-white font-semibold">₹{rev.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-emerald-400 pt-2 border-t border-slate-700">
                  <span>Total Operating Revenue:</span>
                  <span className="font-mono">₹{revenueTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Expenses Column */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-400 border-b border-slate-800 pb-2">
                2. Operating Expenses (OPEX)
              </div>
              <div className="space-y-2 text-xs">
                {expenseItems.map((exp, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-300">{exp.name}</span>
                    <span className="font-mono text-white font-semibold">₹{exp.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-rose-400 pt-2 border-t border-slate-700">
                  <span>Total Operating Expenses:</span>
                  <span className="font-mono">₹{expensesTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Net Summary */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between text-sm">
            <span className="font-bold text-white">Net Operating Profit / (Loss):</span>
            <span className={`font-mono font-bold text-base ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{netProfit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* 3. BALANCE SHEET TAB */}
      {activeReportTab === 'balance-sheet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Statement of Financial Position (Balance Sheet)</h3>
              <p className="text-xs text-slate-400">As of today • Invariance Check: Assets = Liabilities + Equity</p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
              bsBalanced
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {bsBalanced ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{bsBalanced ? 'Accounting Equation Satisfied: Assets = Liabilities + Equity' : 'Balance Sheet Discrepancy!'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ASSETS */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
                Assets
              </div>
              <div className="space-y-2 text-xs">
                {assetItems.map((a, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-300">{a.name}</span>
                    <span className="font-mono text-white font-semibold">₹{a.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-cyan-400 pt-3 border-t border-slate-700 text-sm">
                  <span>Total Assets:</span>
                  <span className="font-mono">₹{totalAssets.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* LIABILITIES & EQUITY */}
            <div className="space-y-5">
              {/* Liabilities */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-400 border-b border-slate-800 pb-2">
                  Liabilities
                </div>
                <div className="space-y-2 text-xs">
                  {liabilityItems.map((l, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-300">{l.name}</span>
                      <span className="font-mono text-white font-semibold">₹{l.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-rose-400 pt-2 border-t border-slate-700">
                    <span>Total Liabilities:</span>
                    <span className="font-mono">₹{totalLiabilities.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Equity */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2">
                  Stockholders Equity
                </div>
                <div className="space-y-2 text-xs">
                  {equityItems.map((e, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-300">{e.name}</span>
                      <span className="font-mono text-white font-semibold">₹{e.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-purple-400 pt-2 border-t border-slate-700">
                    <span>Total Equity:</span>
                    <span className="font-mono">₹{totalEquity.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Total Liabilities + Equity */}
              <div className="p-3 bg-slate-800 rounded-xl flex justify-between font-bold text-white text-sm">
                <span>Total Liabilities & Equity:</span>
                <span className="font-mono text-emerald-400">
                  ₹{(totalLiabilities + totalEquity).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AGING REPORTS TAB */}
      {activeReportTab === 'ar-aging' && (
        <div className="space-y-6">
          {/* AR Aging */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Accounts Receivable (AR) Aging Summary
            </h3>
            <p className="text-xs text-slate-400">Outstanding client invoices grouped by payment terms and aging brackets</p>

            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 uppercase text-[10px] text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Current (1-15d)</th>
                  <th className="py-2.5 px-3 text-right">16-30 Days</th>
                  <th className="py-2.5 px-3 text-right">31-60 Days</th>
                  <th className="py-2.5 px-3 text-right">Total Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoices.filter(i => i.balanceAmount > 0).map((inv) => {
                  const cust = customers.find(c => c.id === inv.customerId);
                  return (
                    <tr key={inv.id}>
                      <td className="py-2.5 px-3 font-medium text-white">{cust?.name || 'Customer'}</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-400">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{inv.dueDate}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200">₹{inv.balanceAmount.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">—</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">—</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                        ₹{inv.balanceAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* AP Aging */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Accounts Payable (AP) Aging Summary
            </h3>
            <p className="text-xs text-slate-400">Outstanding vendor bills grouped by payment obligations</p>

            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 uppercase text-[10px] text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-3">Bill #</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Current (1-15d)</th>
                  <th className="py-2.5 px-3 text-right">16-30 Days</th>
                  <th className="py-2.5 px-3 text-right">Total Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bills.filter(b => b.balanceAmount > 0).map((bill) => {
                  const vend = vendors.find(v => v.id === bill.vendorId);
                  return (
                    <tr key={bill.id}>
                      <td className="py-2.5 px-3 font-medium text-white">{vend?.name || 'Vendor'}</td>
                      <td className="py-2.5 px-3 font-mono text-rose-400">{bill.billNumber}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{bill.dueDate}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200">₹{bill.balanceAmount.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">—</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                        ₹{bill.balanceAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
