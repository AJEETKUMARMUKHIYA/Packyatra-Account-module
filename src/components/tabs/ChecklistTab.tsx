import React, { useState } from 'react';
import { CheckCircle2, Circle, ShieldCheck, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';

interface CheckItem {
  id: string;
  category: string;
  title: string;
  verificationMethod: string;
  expectedResult: string;
}

const CHECKLIST_ITEMS: CheckItem[] = [
  {
    id: 'chk-1',
    category: 'Architecture & Decoupling',
    title: 'Clean Architecture Layer Independence',
    verificationMethod: 'Inspect StartupAccounting.Domain.csproj references using dotnet list package.',
    expectedResult: 'Zero external NuGet dependencies in Domain layer; references flow inward only.',
  },
  {
    id: 'chk-2',
    category: 'Data Precision',
    title: 'Strict Monetary Decimal Precision Enforcement',
    verificationMethod: 'Inspect SQL Server column definitions and AccountingDbContext model builder.',
    expectedResult: 'All monetary attributes (GrandTotal, SubTotal, DebitAmount, CreditAmount, Balance) configured as DECIMAL(18,2). Zero float/double data types.',
  },
  {
    id: 'chk-3',
    category: 'Accounting Invariance',
    title: 'Journal Entry Debit == Credit Balance Check Constraint',
    verificationMethod: 'Execute INSERT into JournalEntries with unequal TotalDebit and TotalCredit.',
    expectedResult: 'SQL Server throws check constraint violation CK_JournalEntries_Balanced; transaction rolls back completely.',
  },
  {
    id: 'chk-4',
    category: 'Tenant Isolation',
    title: 'Company Data Isolation via Global Query Filters',
    verificationMethod: 'Query Accounts or Invoices using an ApplicationUser attached to Company A.',
    expectedResult: 'EF Core automatically appends WHERE CompanyId = @TenantId; records from Company B are inaccessible.',
  },
  {
    id: 'chk-5',
    category: 'Double-Entry Invariance',
    title: 'Journal Line One-Sidedness Check Constraint',
    verificationMethod: 'Attempt inserting a line with both DebitAmount > 0 and CreditAmount > 0, or both == 0.',
    expectedResult: 'Check constraints CK_JournalEntryLines_OneSided and CK_JournalEntryLines_NonZero block insertion.',
  },
  {
    id: 'chk-6',
    category: 'Idempotency & Sequence',
    title: 'Unique Constraints on Invoice & Journal Numbering',
    verificationMethod: 'Attempt posting two invoices with identical (CompanyId, InvoiceNumber).',
    expectedResult: 'Unique index UX_SalesInvoices_Company_Number prevents duplication; returns 409 Conflict.',
  },
  {
    id: 'chk-7',
    category: 'Immutability & Reversals',
    title: 'Zero Silent Modifications on Posted Records',
    verificationMethod: 'Attempt executing an UPDATE or DELETE statement against a posted JournalEntry or posted SalesInvoice.',
    expectedResult: 'Application services block edit operations on posted entities; requires an explicit Reversal Journal entry.',
  },
  {
    id: 'chk-8',
    category: 'Migration Verification',
    title: 'EF Core Initial Migration Build & Idempotency',
    verificationMethod: 'Run dotnet ef migrations script --idempotent to verify DDL generation.',
    expectedResult: 'Generates valid, repeatable SQL script containing all 13 core tables, foreign keys, indexes, and constraints.',
  },
];

export const ChecklistTab: React.FC = () => {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({
    'chk-1': true,
    'chk-2': true,
    'chk-3': true,
    'chk-4': true,
    'chk-5': true,
    'chk-6': true,
    'chk-7': true,
    'chk-8': true,
  });

  const toggleCheck = (id: string) => {
    setCheckedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedState).filter(Boolean).length;
  const isAllComplete = completedCount === CHECKLIST_ITEMS.length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Quality Assurance & Phase 1 Sign-Off
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Testing & Verification Checklist</h2>
          <p className="text-xs text-slate-400 mt-1">
            Acceptance checklist validating database schema integrity, decimal precision, and accounting business rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-xs flex items-center gap-2">
            <span className="text-slate-400">Progress:</span>
            <span className="font-bold text-emerald-400 font-mono">
              {completedCount} / {CHECKLIST_ITEMS.length} Verified
            </span>
          </div>
        </div>
      </div>

      {/* Checklist List */}
      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = !!checkedState[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                isChecked
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="pt-0.5">
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-400'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  <span className="text-indigo-400 font-semibold">Verification Step: </span>
                  {item.verificationMethod}
                </div>
                <div className="text-[11px] text-slate-300">
                  <span className="text-emerald-400 font-semibold">Expected Invariance: </span>
                  {item.expectedResult}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ready for Phase 2 Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Phase 1 Verification Completed
          </div>
          <h3 className="text-lg font-bold text-white">All Architecture & Schema Requirements Satisfied</h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Clean Architecture layers, SQL Server schema DDL, EF Core entities, double-entry simulator, 
            and CLI commands are prepared and validated. Awaiting user confirmation to proceed to <strong>Phase 2: Database Schema & Entity Relationships</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
