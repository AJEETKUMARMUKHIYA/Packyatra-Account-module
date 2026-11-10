import React, { useState } from 'react';
import { BadgePercent, Plus, CheckCircle, Search, X } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

export const ExpensesView: React.FC = () => {
  const { expenses, accounts, bankAccounts, vendors, createExpense } = useAccounting();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [expenseAccountId, setExpenseAccountId] = useState(
    accounts.find(a => a.category === 'Expense')?.id || ''
  );
  const [paymentAccountId, setPaymentAccountId] = useState(
    bankAccounts[0]?.linkedAccountId || accounts.find(a => a.category === 'Asset')?.id || ''
  );
  const [vendorId, setVendorId] = useState(vendors[0]?.id || '');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(5000);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Corporate Card');
  const [description, setDescription] = useState('');

  const totalAmount = (Number(amount) || 0) + (Number(taxAmount) || 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExpense({
      expenseAccountId,
      paymentAccountId,
      vendorId: vendorId || undefined,
      expenseDate,
      amount: Number(amount),
      taxAmount: Number(taxAmount),
      totalAmount,
      paymentMethod,
      description: description.trim() || 'Operational Expense',
    });
    setDescription('');
    setAmount(5000);
    setShowAddModal(false);
  };

  const filteredExpenses = expenses.filter((e) =>
    e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <BadgePercent className="w-4 h-4" /> Operational Cost Tracking
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Direct Expenses</h2>
          <p className="text-xs text-slate-400 mt-1">
            Capture operational overheads (cloud hosting, travel, office supplies, software subscriptions) and post to ledger.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Record New Expense
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search expenses by description or payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense Account</th>
                <th className="py-3 px-4">Paid From</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredExpenses.map((exp) => {
                const expAcc = accounts.find((a) => a.id === exp.expenseAccountId);
                const pmtAcc = accounts.find((a) => a.id === exp.paymentAccountId);
                const vend = vendors.find((v) => v.id === exp.vendorId);

                return (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{exp.expenseDate}</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      <span className="font-mono text-indigo-400 mr-1.5">{expAcc?.code}</span>
                      {expAcc?.name || 'Expense'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <span className="font-mono text-cyan-400 mr-1.5">{pmtAcc?.code}</span>
                      {pmtAcc?.name || 'Bank'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{vend?.name || '—'}</td>
                    <td className="py-3 px-4 text-slate-200">{exp.description}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{exp.paymentMethod}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      ₹{exp.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Posted
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Record Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Record Operational Expense</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Expense Account</label>
                <select
                  value={expenseAccountId}
                  onChange={(e) => setExpenseAccountId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                >
                  {accounts.filter(a => a.category === 'Expense').map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Paid From (Bank / Cash Account)</label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                >
                  {accounts.filter(a => a.category === 'Asset').map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Corporate Debit Card">Corporate Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="UPI">UPI</option>
                    <option value="Petty Cash">Petty Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Base Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Tax Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. AWS Production Database hosting fees"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>

              <div className="p-3 bg-slate-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Ledger Posting:</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Post Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
