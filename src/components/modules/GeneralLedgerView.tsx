import React, { useState } from 'react';
import { FileSpreadsheet, Search, Filter, Calendar, BookOpen } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

export const GeneralLedgerView: React.FC = () => {
  const { accounts, getGeneralLedger } = useAccounting();
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[3]?.id || accounts[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const ledgerRows = selectedAccountId ? getGeneralLedger(selectedAccountId) : [];

  const filteredRows = ledgerRows.filter((r) =>
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.journalNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDebits = ledgerRows.reduce((acc, r) => acc + r.debit, 0);
  const totalCredits = ledgerRows.reduce((acc, r) => acc + r.credit, 0);
  const closingBalance = ledgerRows.length > 0 ? ledgerRows[ledgerRows.length - 1].balance : 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" /> Permanent Accounting Record
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">General Ledger (GL)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Chronological audit trail and running balance breakdown for each individual chart of account head.
          </p>
        </div>
      </div>

      {/* Account Selector & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select Ledger Head
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.name} ({a.category} • Normal: {a.normalBalance})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative flex-1 min-w-[240px]">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Filter Ledger Entries
          </label>
          <input
            type="text"
            placeholder="Search description, journal #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-7" />
        </div>
      </div>

      {/* Ledger Header Card */}
      {selectedAccount && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-indigo-400">{selectedAccount.code}</span>
              <h3 className="text-base font-bold text-white">{selectedAccount.name}</h3>
              <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {selectedAccount.category}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Normal Orientation: <strong>{selectedAccount.normalBalance}</strong> • Entries: {ledgerRows.length}
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Total Debits</div>
              <div className="font-mono font-bold text-emerald-400 text-sm">₹{totalDebits.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Total Credits</div>
              <div className="font-mono font-bold text-indigo-400 text-sm">₹{totalCredits.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase">Closing Balance</div>
              <div className="font-mono font-bold text-white text-base">₹{closingBalance.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      )}

      {/* General Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Journal #</th>
                <th className="py-3 px-4">Source Type</th>
                <th className="py-3 px-4">Particulars / Description</th>
                <th className="py-3 px-4 text-right">Debit (₹)</th>
                <th className="py-3 px-4 text-right">Credit (₹)</th>
                <th className="py-3 px-4 text-right">Running Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs italic">
                    No transactions recorded for this ledger account yet.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{row.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">{row.journalNumber}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {row.sourceType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">{row.description}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold">
                      {row.debit > 0 ? `₹${row.debit.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-indigo-400 font-semibold">
                      {row.credit > 0 ? `₹${row.credit.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      ₹{row.balance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredRows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-700 font-bold text-white text-xs bg-slate-800/40">
                  <td colSpan={4} className="py-3 px-4 uppercase tracking-wider text-slate-400">
                    Period Net Totals
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400">
                    ₹{totalDebits.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-indigo-400">
                    ₹{totalCredits.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-white text-sm">
                    ₹{closingBalance.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
