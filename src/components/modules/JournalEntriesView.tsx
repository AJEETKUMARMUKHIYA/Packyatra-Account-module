import React, { useState } from 'react';
import { 
  Scale, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  X, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Info
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

export const JournalEntriesView: React.FC = () => {
  const { journalEntries, accounts, postManualJournal, reverseJournalEntry } = useAccounting();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(journalEntries[0]?.id || null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Journal State
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([
    { accountId: accounts[0]?.id || '', debit: 10000, credit: 0, description: '' },
    { accountId: accounts[1]?.id || '', debit: 0, credit: 10000, description: '' },
  ]);

  const updateLine = (index: number, field: string, value: any) => {
    setLines((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { accountId: accounts[0]?.id || '', debit: 0, credit: 0, description: '' },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const totalDebit = lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff < 0.01 && totalDebit > 0;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    const success = postManualJournal(
      description.trim() || 'Manual Journal Posting',
      lines.map((l) => ({
        accountId: l.accountId,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        description: l.description,
      }))
    );

    if (success) {
      setDescription('');
      setShowCreateModal(false);
    }
  };

  const filteredJournals = journalEntries.filter((j) => {
    return (
      j.journalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.sourceType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-4 h-4" /> The Double-Entry General Ledger Core
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Journal Entries</h2>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative, immutable transaction log. Debits strictly equal Credits for every entry. Corrections require offsetting reversals.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Manual Journal
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search journal entries by number, source, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-3">
        {filteredJournals.map((j) => {
          const isExpanded = expandedId === j.id;

          return (
            <div
              key={j.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md transition-all"
            >
              {/* Journal Card Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : j.id)}
                className="bg-slate-800/60 hover:bg-slate-800 px-4 py-3 cursor-pointer flex flex-wrap items-center justify-between gap-3 border-b border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-indigo-400">{j.journalNumber}</span>
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-medium">
                        {j.sourceType}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{j.transactionDate}</span>
                    </div>
                    <div className="text-xs font-semibold text-white mt-1 line-clamp-1">{j.description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-emerald-400">
                      ₹{j.totalDebit.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">{j.lines.length} balanced lines</div>
                  </div>

                  {/* Reversal Action */}
                  {!j.isReversed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reverseJournalEntry(j.id);
                      }}
                      className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                      title="Post offsetting reversal entry without modifying historical records"
                    >
                      <RotateCcw className="w-3 h-3" /> Reversal
                    </button>
                  )}
                  {j.isReversed && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                      Reversed
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Lines Table */}
              {isExpanded && (
                <div className="p-4 bg-slate-950/70 overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                      <tr>
                        <th className="pb-2">Account Code & Name</th>
                        <th className="pb-2">Line Description</th>
                        <th className="pb-2 text-right">Debit (₹)</th>
                        <th className="pb-2 text-right">Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {j.lines.map((l) => {
                        const acc = accounts.find((a) => a.id === l.accountId);
                        return (
                          <tr key={l.id} className="hover:bg-slate-800/20">
                            <td className="py-2">
                              <span className="font-mono font-bold text-indigo-300 mr-2">{acc?.code}</span>
                              <span className="text-white">{acc?.name || 'Account'}</span>
                            </td>
                            <td className="py-2 text-slate-400 text-[11px]">{l.description || '—'}</td>
                            <td className="py-2 text-right font-mono text-emerald-400 font-semibold">
                              {l.debit > 0 ? `₹${l.debit.toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td className="py-2 text-right font-mono text-indigo-400 font-semibold">
                              {l.credit > 0 ? `₹${l.credit.toLocaleString('en-IN')}` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-700 font-bold text-white text-xs">
                        <td colSpan={2} className="pt-2 text-slate-400">Total (Balanced Invariance Checked)</td>
                        <td className="pt-2 text-right font-mono text-emerald-400">
                          ₹{j.totalDebit.toLocaleString('en-IN')}
                        </td>
                        <td className="pt-2 text-right font-mono text-indigo-400">
                          ₹{j.totalCredit.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60 pt-2">
                    <span>Posted By: <span className="font-mono text-slate-400">{j.postedBy}</span></span>
                    <span>Timestamp: <span className="font-mono text-slate-400">{new Date(j.postedAt).toLocaleString()}</span></span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: Create Manual Journal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">New Manual Journal Entry</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Journal Description</label>
                <input
                  type="text"
                  placeholder="e.g. Accrual for month-end utilities, Depreciation entry..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>

              {/* Dynamic Lines */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    Journal Lines (Dr = Cr)
                  </span>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((l, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <div className="md:col-span-5">
                        <select
                          value={l.accountId}
                          onChange={(e) => updateLine(idx, 'accountId', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                        >
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.code} - {a.name} ({a.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <input
                          type="text"
                          placeholder="Description"
                          value={l.description}
                          onChange={(e) => updateLine(idx, 'description', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <input
                          type="number"
                          placeholder="Debit (₹)"
                          min="0"
                          value={l.debit}
                          onChange={(e) => updateLine(idx, 'debit', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white text-right font-mono"
                        />
                      </div>

                      <div className="md:col-span-2 flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="Credit (₹)"
                          min="0"
                          value={l.credit}
                          onChange={(e) => updateLine(idx, 'credit', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white text-right font-mono"
                        />
                        {lines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Balance Validation Indicator */}
              <div className="p-3 bg-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400">Total Debit: </span>
                  <span className="font-mono font-bold text-emerald-400 mr-4">₹{totalDebit.toLocaleString('en-IN')}</span>
                  <span className="text-slate-400">Total Credit: </span>
                  <span className="font-mono font-bold text-indigo-400">₹{totalCredit.toLocaleString('en-IN')}</span>
                </div>

                <div className={`flex items-center gap-1.5 font-bold text-xs ${
                  isBalanced ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isBalanced ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{isBalanced ? 'Balanced (Zero Diff)' : `Imbalance: ₹${diff.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className={`px-5 py-2 rounded-xl text-white font-bold transition-all ${
                    isBalanced
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-700 opacity-50 cursor-not-allowed'
                  }`}
                >
                  Post Journal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
