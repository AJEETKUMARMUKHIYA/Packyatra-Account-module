import React, { useState } from 'react';
import { 
  Scale, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  ArrowRight, 
  FileSpreadsheet, 
  Layers,
  Coins,
  History
} from 'lucide-react';
import { JournalEntrySim, JournalLineSim } from '../../types';

export const JournalSimulatorTab: React.FC = () => {
  // Initial seed with prompt's specific Example A
  const initialJournals: JournalEntrySim[] = [
    {
      id: 'jrn-1',
      journalNumber: 'JRN-2026-0001',
      date: '2026-10-20',
      sourceType: 'SalesInvoice',
      sourceReference: 'INV-2026-1001',
      description: 'Posting Sales Invoice: Software Consulting & Dev Services for Alpha Corp',
      totalDebit: 59000,
      totalCredit: 59000,
      isBalanced: true,
      postedAt: '2026-10-20T10:30:00Z',
      postedBy: 'accountant@startup.io',
      lines: [
        {
          id: 'l1',
          accountId: '1020',
          accountCode: '1020',
          accountName: 'Accounts Receivable (Alpha Corp)',
          category: 'Asset',
          debit: 59000,
          credit: 0,
          description: 'Receivable for Invoice INV-2026-1001',
        },
        {
          id: 'l2',
          accountId: '4010',
          accountCode: '4010',
          accountName: 'Software Development Revenue',
          category: 'Revenue',
          debit: 0,
          credit: 50000,
          description: 'Consulting fees (Base amount)',
        },
        {
          id: 'l3',
          accountId: '2020',
          accountCode: '2020',
          accountName: 'Output GST Payable (18%)',
          category: 'Liability',
          debit: 0,
          credit: 9000,
          description: 'Output CGST + SGST (9% + 9%)',
        },
      ],
    },
  ];

  const [journals, setJournals] = useState<JournalEntrySim[]>(initialJournals);
  const [selectedPreset, setSelectedPreset] = useState<string>('receipt');

  // Add Preset Transaction
  const handlePostPreset = (presetKey: string) => {
    const nextSeq = journals.length + 1;
    const num = `JRN-2026-${String(nextSeq).padStart(4, '0')}`;
    let newEntry: JournalEntrySim | null = null;

    if (presetKey === 'receipt') {
      // Example B from prompt: Customer payment ₹59,000
      newEntry = {
        id: `jrn-${Date.now()}`,
        journalNumber: num,
        date: '2026-10-25',
        sourceType: 'CustomerReceipt',
        sourceReference: 'REC-2026-1001',
        description: 'Customer Payment received for INV-2026-1001 via HDFC Bank NEFT',
        totalDebit: 59000,
        totalCredit: 59000,
        isBalanced: true,
        postedAt: new Date().toISOString(),
        postedBy: 'finance_mgr@startup.io',
        lines: [
          {
            id: `l-${Date.now()}-1`,
            accountId: '1010',
            accountCode: '1010',
            accountName: 'HDFC Corporate Current Bank Account',
            category: 'Asset',
            debit: 59000,
            credit: 0,
            description: 'Funds received in bank',
          },
          {
            id: `l-${Date.now()}-2`,
            accountId: '1020',
            accountCode: '1020',
            accountName: 'Accounts Receivable (Alpha Corp)',
            category: 'Asset',
            debit: 0,
            credit: 59000,
            description: 'Clear customer receivable',
          },
        ],
      };
    } else if (presetKey === 'expense') {
      // Example C from prompt: Expense paid through bank ₹10,000
      newEntry = {
        id: `jrn-${Date.now()}`,
        journalNumber: num,
        date: '2026-10-26',
        sourceType: 'Expense',
        sourceReference: 'EXP-2026-0042',
        description: 'Office Co-working Rent for October paid via Net Banking',
        totalDebit: 10000,
        totalCredit: 10000,
        isBalanced: true,
        postedAt: new Date().toISOString(),
        postedBy: 'accountant@startup.io',
        lines: [
          {
            id: `l-${Date.now()}-1`,
            accountId: '5010',
            accountCode: '5010',
            accountName: 'Office Rent & Facilities Expense',
            category: 'Expense',
            debit: 10000,
            credit: 0,
            description: 'Monthly office rent',
          },
          {
            id: `l-${Date.now()}-2`,
            accountId: '1010',
            accountCode: '1010',
            accountName: 'HDFC Corporate Current Bank Account',
            category: 'Asset',
            debit: 0,
            credit: 10000,
            description: 'Direct bank debit',
          },
        ],
      };
    } else if (presetKey === 'bill') {
      // Vendor Bill: Cloud Hosting ₹20,000 + 18% GST ₹3,600 = ₹23,600
      newEntry = {
        id: `jrn-${Date.now()}`,
        journalNumber: num,
        date: '2026-10-24',
        sourceType: 'PurchaseBill',
        sourceReference: 'BILL-AWS-9821',
        description: 'AWS Cloud Server Hosting Bill for October',
        totalDebit: 23600,
        totalCredit: 23600,
        isBalanced: true,
        postedAt: new Date().toISOString(),
        postedBy: 'accountant@startup.io',
        lines: [
          {
            id: `l-${Date.now()}-1`,
            accountId: '5020',
            accountCode: '5020',
            accountName: 'Cloud Hosting & Infrastructure Expense',
            category: 'Expense',
            debit: 20000,
            credit: 0,
            description: 'AWS production cluster',
          },
          {
            id: `l-${Date.now()}-2`,
            accountId: '1030',
            accountCode: '1030',
            accountName: 'Input Tax Credit (ITC - GST)',
            category: 'Asset',
            debit: 3600,
            credit: 0,
            description: 'Eligible ITC claimable',
          },
          {
            id: `l-${Date.now()}-3`,
            accountId: '2010',
            accountCode: '2010',
            accountName: 'Accounts Payable (Amazon Web Services)',
            category: 'Liability',
            debit: 0,
            credit: 23600,
            description: 'Accounts payable obligation',
          },
        ],
      };
    }

    if (newEntry) {
      setJournals([newEntry, ...journals]);
    }
  };

  // Reversal workflow demonstration (never silent delete!)
  const handleReverseJournal = (target: JournalEntrySim) => {
    const nextSeq = journals.length + 1;
    const reversalNumber = `REV-${target.journalNumber}`;
    
    // Invert debits and credits
    const reversalLines: JournalLineSim[] = target.lines.map((line, idx) => ({
      id: `rev-${Date.now()}-${idx}`,
      accountId: line.accountId,
      accountCode: line.accountCode,
      accountName: line.accountName,
      category: line.category,
      debit: line.credit, // Invert!
      credit: line.debit, // Invert!
      description: `Reversal of [${line.accountCode}] in ${target.journalNumber}`,
    }));

    const reversalEntry: JournalEntrySim = {
      id: `rev-${Date.now()}`,
      journalNumber: reversalNumber,
      date: '2026-10-26',
      sourceType: target.sourceType,
      sourceReference: `Offsetting ${target.journalNumber}`,
      description: `REVERSAL of ${target.journalNumber}: ${target.description}`,
      totalDebit: target.totalCredit,
      totalCredit: target.totalDebit,
      isBalanced: true,
      postedAt: new Date().toISOString(),
      postedBy: 'auditor@startup.io',
      lines: reversalLines,
    };

    setJournals([reversalEntry, ...journals]);
  };

  // Compute Trial Balance aggregated across all posted lines
  const ledgerMap: Record<string, { code: string; name: string; category: string; debit: number; credit: number }> = {};

  journals.forEach((j) => {
    j.lines.forEach((l) => {
      if (!ledgerMap[l.accountCode]) {
        ledgerMap[l.accountCode] = {
          code: l.accountCode,
          name: l.accountName,
          category: l.category,
          debit: 0,
          credit: 0,
        };
      }
      ledgerMap[l.accountCode].debit += l.debit;
      ledgerMap[l.accountCode].credit += l.credit;
    });
  });

  const trialBalanceRows = Object.values(ledgerMap);
  const totalTbDebit = trialBalanceRows.reduce((acc, r) => acc + r.debit, 0);
  const totalTbCredit = trialBalanceRows.reduce((acc, r) => acc + r.credit, 0);
  const isTbBalanced = totalTbDebit === totalTbCredit;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-4 h-4" /> Real-Time Double-Entry Engine Simulator
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Atomic Journal Posting & Trial Balance</h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate posting real transactions (Invoices, Receipts, Expenses, Bills) and watch balanced journal generation in action.
          </p>
        </div>

        {/* Balance Status Indicator */}
        <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
          isTbBalanced 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {isTbBalanced ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{isTbBalanced ? 'Ledger Balanced: Debits == Credits' : 'Ledger Out of Balance!'}</span>
        </div>
      </div>

      {/* Preset Action Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Simulate Posting Event:</span>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="receipt">Example B: Customer Payment (₹59,000 to Bank)</option>
            <option value="expense">Example C: Office Rent Expense (₹10,000 from Bank)</option>
            <option value="bill">Example D: AWS Cloud Bill (₹20,000 + ₹3,600 ITC to AP)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePostPreset(selectedPreset)}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Post Transaction Atomically
          </button>
          <button
            onClick={() => setJournals(initialJournals)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-all"
            title="Reset to initial state"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Two Column Layout: Journal Entries on Left, Live Trial Balance on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Posted Journal Entries (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" /> Posted Journal Entries ({journals.length})
            </h3>
            <span className="text-[11px] text-slate-500">Immutable Ledger Entries (Status = Posted)</span>
          </div>

          <div className="space-y-3.5">
            {journals.map((j) => (
              <div
                key={j.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md"
              >
                {/* Journal Header */}
                <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-700/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">{j.journalNumber}</span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                      {j.sourceType}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{j.sourceReference}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">{j.date}</span>
                    <button
                      onClick={() => handleReverseJournal(j)}
                      className="text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1 transition-all"
                      title="Post offsetting reversal entry to correct this without deleting"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> Reversal
                    </button>
                  </div>
                </div>

                <div className="px-4 py-2 text-xs text-slate-300 bg-slate-900/60 border-b border-slate-800">
                  {j.description}
                </div>

                {/* Lines */}
                <div className="p-3">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                        <th className="pb-1.5">Account Code & Name</th>
                        <th className="pb-1.5 text-right">Debit (₹)</th>
                        <th className="pb-1.5 text-right">Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {j.lines.map((l) => (
                        <tr key={l.id} className="text-slate-300">
                          <td className="py-1.5 font-mono text-[11px]">
                            <span className="text-indigo-300 font-semibold">{l.accountCode}</span>{' '}
                            <span className="text-slate-200">{l.accountName}</span>
                          </td>
                          <td className="py-1.5 text-right font-mono text-emerald-400 font-semibold">
                            {l.debit > 0 ? `₹${l.debit.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="py-1.5 text-right font-mono text-indigo-400 font-semibold">
                            {l.credit > 0 ? `₹${l.credit.toLocaleString('en-IN')}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-700 font-bold text-white text-xs">
                        <td className="pt-2 text-slate-400">Total (Balanced)</td>
                        <td className="pt-2 text-right font-mono text-emerald-400">
                          ₹{j.totalDebit.toLocaleString('en-IN')}
                        </td>
                        <td className="pt-2 text-right font-mono text-indigo-400">
                          ₹{j.totalCredit.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Trial Balance (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Live Trial Balance
            </h3>
            <span className="text-[11px] text-emerald-400 font-mono">Real-time</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <p className="text-[11px] text-slate-400 mb-3">
              Aggregated from posted journal entries. Confirms mathematical integrity across all 5 account categories.
            </p>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-700 pb-2">
                  <th className="pb-2">Account</th>
                  <th className="pb-2 text-right">Debit (₹)</th>
                  <th className="pb-2 text-right">Credit (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {trialBalanceRows.map((row) => (
                  <tr key={row.code} className="hover:bg-slate-800/40">
                    <td className="py-2">
                      <div className="font-mono text-[11px] text-indigo-300 font-semibold">{row.code}</div>
                      <div className="text-[11px] text-slate-300 truncate max-w-[170px]" title={row.name}>{row.name}</div>
                    </td>
                    <td className="py-2 text-right font-mono text-emerald-400 text-xs">
                      {row.debit > 0 ? `₹${row.debit.toLocaleString('en-IN')}` : '0.00'}
                    </td>
                    <td className="py-2 text-right font-mono text-indigo-400 text-xs">
                      {row.credit > 0 ? `₹${row.credit.toLocaleString('en-IN')}` : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-600 font-bold text-white text-xs">
                  <td className="pt-3 text-slate-300">Total Sum</td>
                  <td className="pt-3 text-right font-mono text-emerald-400">
                    ₹{totalTbDebit.toLocaleString('en-IN')}
                  </td>
                  <td className="pt-3 text-right font-mono text-indigo-400">
                    ₹{totalTbCredit.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="pt-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center text-xs font-semibold">
                      Difference = ₹{(totalTbDebit - totalTbCredit).toFixed(2)} (Perfect Zero Imbalance)
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Quick Explanation */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Mandatory Double-Entry Rules
            </h4>
            <p>1. Debits increase Assets & Expenses; decrease Liabilities, Equity, and Revenue.</p>
            <p>2. Credits increase Liabilities, Equity, and Revenue; decrease Assets & Expenses.</p>
            <p>3. Every posted journal is atomic: if any line fails, none are recorded.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
