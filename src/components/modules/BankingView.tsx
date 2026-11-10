import React, { useState } from 'react';
import { Landmark, ArrowRightLeft, CheckCircle, Search, X, CheckCircle2, ShieldCheck, History } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

export const BankingView: React.FC = () => {
  const { bankAccounts, transferBetweenBanks, payments } = useAccounting();
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Transfer Form State
  const [fromBankId, setFromBankId] = useState(bankAccounts[0]?.id || '');
  const [toBankId, setToBankId] = useState(bankAccounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState<number>(50000);
  const [refNumber, setRefNumber] = useState(`TXN-${Date.now().toString().slice(-6)}`);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = transferBetweenBanks(fromBankId, toBankId, Number(transferAmount), refNumber);
    if (success) {
      setShowTransferModal(false);
      setRefNumber(`TXN-${Date.now().toString().slice(-6)}`);
    }
  };

  const totalBankLiquidity = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Landmark className="w-4 h-4" /> Treasury & Liquidity Management
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Bank Accounts & Reconciliation</h2>
          <p className="text-xs text-slate-400 mt-1">
            Maintain company bank accounts, execute internal fund transfers without P&L distortion, and reconcile ledger statements.
          </p>
        </div>

        <button
          onClick={() => setShowTransferModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
        >
          <ArrowRightLeft className="w-4 h-4" /> Inter-Bank Transfer
        </button>
      </div>

      {/* Bank Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bankAccounts.map((b) => (
          <div
            key={b.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{b.bankName}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{b.branchName}</div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  Active Checking
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Account Number</span>
                  <span className="font-mono text-slate-200 font-bold">{b.accountNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">IFSC Code</span>
                  <span className="font-mono text-slate-200 font-bold">{b.ifscCode}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Available Book Balance</span>
                <div className="font-mono text-xl font-bold text-emerald-400">
                  ₹{b.currentBalance.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                Opening: ₹{b.openingBalance.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Internal Transfer Architecture Policy Notice */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1.5">
        <div className="font-bold text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Accounting Invariant for Bank Transfers
        </div>
        <p className="text-slate-400 leading-relaxed">
          Internal transfers between company accounts debit the destination bank account and credit the source bank account. 
          The system strictly prevents bank transfers from being recorded as revenue or expense, preserving the integrity of the Profit and Loss statement.
        </p>
      </div>

      {/* MODAL: Inter-Bank Transfer */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Internal Bank Transfer</h3>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">From Bank Account (Credit Source)</label>
                <select
                  value={fromBankId}
                  onChange={(e) => setFromBankId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} (Bal: ₹{b.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">To Bank Account (Debit Destination)</label>
                <select
                  value={toBankId}
                  onChange={(e) => setToBankId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} (Bal: ₹{b.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Transfer Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Transfer Reference / UTR</label>
                <input
                  type="text"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
