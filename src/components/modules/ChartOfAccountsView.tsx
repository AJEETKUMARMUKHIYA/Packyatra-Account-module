import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  X,
  Filter
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { AccountCategory, NormalBalance } from '../../types/accounting';

export const ChartOfAccountsView: React.FC = () => {
  const { accounts, addAccount, getTrialBalance } = useAccounting();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Account Form State
  const [accountCode, setAccountCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [category, setCategory] = useState<AccountCategory>('Expense');
  const [normalBalance, setNormalBalance] = useState<NormalBalance>('Debit');
  const [description, setDescription] = useState('');

  const { items: tbItems } = getTrialBalance();
  const balanceMap = Object.fromEntries(
    tbItems.map((item) => [
      item.accountId,
      item.normalBalance === 'Debit' ? item.debitBalance : item.creditBalance,
    ])
  );

  const categories: AccountCategory[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  const filteredAccounts = accounts.filter((acc) => {
    const matchesCategory = selectedCategory === 'all' || acc.category === selectedCategory;
    const matchesSearch =
      acc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (cat: AccountCategory) => {
    setCategory(cat);
    // Set typical normal balance default
    if (cat === 'Asset' || cat === 'Expense') {
      setNormalBalance('Debit');
    } else {
      setNormalBalance('Credit');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = addAccount({
      code: accountCode.trim(),
      name: accountName.trim(),
      category,
      normalBalance,
      isActive: true,
      description,
    });
    if (success) {
      setAccountCode('');
      setAccountName('');
      setDescription('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" /> Core Financial Master
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Chart of Accounts (COA)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Hierarchical 5-category ledger heads. System accounts (AR, AP, Bank, Retained Earnings, GST) are protected by engine invariants.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Ledger Account
        </button>
      </div>

      {/* Filter and Category Pills */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search accounts by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({accounts.length})
          </button>
          {categories.map((cat) => {
            const count = accounts.filter((a) => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Account Code</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Normal Balance</th>
                <th className="py-3 px-4 text-right">Current Ledger Balance</th>
                <th className="py-3 px-4 text-center">Account Type</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAccounts.map((acc) => {
                const bal = balanceMap[acc.id] || 0;
                return (
                  <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {acc.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {acc.name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          acc.category === 'Asset'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : acc.category === 'Liability'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : acc.category === 'Equity'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : acc.category === 'Revenue'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {acc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                      {acc.normalBalance}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      ₹{bal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {acc.isSystemAccount ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          <Lock className="w-3 h-3 text-amber-400" /> System Account
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Custom</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add New Account */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Add New Ledger Account</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Account Code</label>
                <input
                  type="text"
                  placeholder="e.g. 5070, 1070"
                  value={accountCode}
                  onChange={(e) => setAccountCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500">Must be unique within the company.</span>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. Marketing & Advertising Expense"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as AccountCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Normal Balance</label>
                  <select
                    value={normalBalance}
                    onChange={(e) => setNormalBalance(e.target.value as NormalBalance)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Operational purpose of this ledger head"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
