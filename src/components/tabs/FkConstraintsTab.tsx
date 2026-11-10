import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Play, 
  RotateCcw, 
  Database, 
  AlertTriangle,
  Lock,
  Code
} from 'lucide-react';

interface TestCase {
  id: string;
  title: string;
  ruleType: 'Foreign Key' | 'Check Constraint' | 'Unique Index' | 'Multi-Tenant Filter';
  targetConstraint: string;
  scenario: string;
  simulatedSql: string;
  shouldFail: boolean;
  expectedError: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'tc-fk-account-delete',
    title: 'Restrict Delete on Account with Posted Journal Lines',
    ruleType: 'Foreign Key',
    targetConstraint: 'FK_JournalEntryLines_Account (ON DELETE RESTRICT)',
    scenario: 'Admin attempts to DELETE Account 1020 (Accounts Receivable) which has posted ledger entries in JournalEntryLines.',
    simulatedSql: `DELETE FROM dbo.Accounts WHERE AccountId = 'A1020-GUID';`,
    shouldFail: true,
    expectedError: `Msg 547, Level 16, State 0: The DELETE statement conflicted with the REFERENCE constraint "FK_JournalEntryLines_Account". The conflict occurred in database "StartupAccountingDb", table "dbo.JournalEntryLines", column 'AccountId'. Transaction aborted.`,
  },
  {
    id: 'tc-ck-balanced-journal',
    title: 'Reject Unbalanced Journal Entry (Debits != Credits)',
    ruleType: 'Check Constraint',
    targetConstraint: 'CK_JournalEntries_Balanced',
    scenario: 'Application attempts to INSERT a JournalEntry where TotalDebit = ₹59,000 but TotalCredit = ₹50,000 (imbalance of ₹9,000).',
    simulatedSql: `INSERT INTO dbo.JournalEntries (JournalEntryId, CompanyId, JournalNumber, TransactionDate, Description, TotalDebit, TotalCredit, Status, PostedBy)
VALUES (NEWID(), 'COMP-1', 'JRN-2026-0099', '2026-10-26', 'Unbalanced Posting', 59000.00, 50000.00, 'Posted', 'admin');`,
    shouldFail: true,
    expectedError: `Msg 547, Level 16, State 0: The INSERT statement conflicted with the CHECK constraint "CK_JournalEntries_Balanced". The conflict occurred in database "StartupAccountingDb", table "dbo.JournalEntries". TotalDebit must equal TotalCredit and be greater than 0.`,
  },
  {
    id: 'tc-ck-line-onesided',
    title: 'Reject Journal Line with Both Debit & Credit Populated',
    ruleType: 'Check Constraint',
    targetConstraint: 'CK_JournalEntryLines_OneSided',
    scenario: 'Accounting entry line populated with Debit = ₹10,000 and Credit = ₹5,000 simultaneously.',
    simulatedSql: `INSERT INTO dbo.JournalEntryLines (JournalEntryLineId, JournalEntryId, AccountId, DebitAmount, CreditAmount)
VALUES (NEWID(), 'JRN-GUID', 'ACC-GUID', 10000.00, 5000.00);`,
    shouldFail: true,
    expectedError: `Msg 547, Level 16, State 0: The INSERT statement conflicted with the CHECK constraint "CK_JournalEntryLines_OneSided". A journal line cannot possess both DebitAmount > 0 and CreditAmount > 0.`,
  },
  {
    id: 'tc-ux-duplicate-invoice',
    title: 'Reject Duplicate Invoice Number within Same Company',
    ruleType: 'Unique Index',
    targetConstraint: 'UX_SalesInvoices_Company_Number',
    scenario: 'Attempting to post second sales invoice with number "INV-2026-1001" for Company 1.',
    simulatedSql: `INSERT INTO dbo.SalesInvoices (InvoiceId, CompanyId, CustomerId, InvoiceNumber, InvoiceDate, DueDate, SubTotal, TaxAmount, GrandTotal, BalanceAmount, Status, CreatedBy)
VALUES (NEWID(), 'COMP-1', 'CUST-1', 'INV-2026-1001', '2026-10-26', '2026-11-26', 50000.00, 9000.00, 59000.00, 59000.00, 'Draft', 'admin');`,
    shouldFail: true,
    expectedError: `Msg 2601, Level 14, State 1: Cannot insert duplicate key row in object 'dbo.SalesInvoices' with unique index 'UX_SalesInvoices_Company_Number'. The duplicate key value is (COMP-1, INV-2026-1001).`,
  },
  {
    id: 'tc-tenant-cross-leak',
    title: 'Multi-Tenant Isolation Query Filter Enforcement',
    ruleType: 'Multi-Tenant Filter',
    targetConstraint: 'EF Core Global Query Filter: WHERE CompanyId = @TenantId',
    scenario: 'Authenticated user belonging to Company A attempts to load invoice INV-2026-9999 belonging to Company B via API.',
    simulatedSql: `-- Executed EF Core SQL:
SELECT TOP(1) [s].[InvoiceId], [s].[GrandTotal]
FROM [dbo].[SalesInvoices] AS [s]
WHERE [s].[CompanyId] = @__tenantContext_CompanyId_0 AND [s].[InvoiceId] = 'INVOICE-COMPANY-B';`,
    shouldFail: false, // returns empty set / 404
    expectedError: `Zero rows returned. EF Core Query Filter intercepts request: Data from Company B is completely invisible to Company A (HTTP 404 Not Found returned to client).`,
  },
];

export const FkConstraintsTab: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<TestCase>(TEST_CASES[0]);
  const [executionResult, setExecutionResult] = useState<{
    executed: boolean;
    status: 'Blocked' | 'Protected' | 'Error';
    message: string;
  } | null>(null);

  const handleExecuteTest = (test: TestCase) => {
    setSelectedCase(test);
    // Simulate database engine response
    setTimeout(() => {
      setExecutionResult({
        executed: true,
        status: test.shouldFail ? 'Blocked' : 'Protected',
        message: test.expectedError,
      });
    }, 200);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" /> Integrity Constraints & Anti-Corruption Sandbox
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Constraint Validation & Foreign Key Sandbox</h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate illegal operations and verify that SQL Server constraints and EF Core interceptors block data corruption.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Test Case Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
            Select Constraint Scenario to Test
          </div>

          <div className="space-y-2">
            {TEST_CASES.map((tc) => {
              const isSelected = selectedCase.id === tc.id;
              return (
                <button
                  key={tc.id}
                  onClick={() => {
                    setSelectedCase(tc);
                    setExecutionResult(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{tc.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {tc.ruleType}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 line-clamp-2">{tc.scenario}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Execution Inspector & Live Simulation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-sm">{selectedCase.title}</h3>
                <div className="text-[11px] font-mono text-indigo-400 mt-0.5">
                  Target: {selectedCase.targetConstraint}
                </div>
              </div>

              <button
                onClick={() => handleExecuteTest(selectedCase)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
              >
                <Play className="w-3.5 h-3.5" /> Execute Test Query
              </button>
            </div>

            {/* Scenario explanation */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Violation Scenario
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                {selectedCase.scenario}
              </p>
            </div>

            {/* SQL Query */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Attempted SQL / EF Core Operation
              </div>
              <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed border border-slate-800/80">
                {selectedCase.simulatedSql}
              </pre>
            </div>

            {/* Execution Output Simulation */}
            {executionResult && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Database Engine / EF Core Response
                </div>
                <div className="p-4 rounded-xl border bg-rose-950/20 border-rose-500/40 text-rose-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Integrity Guard Enforced: Violation Blocked & Transaction Aborted</span>
                  </div>
                  <pre className="text-[11px] font-mono text-rose-200/90 whitespace-pre-wrap leading-relaxed">
                    {executionResult.message}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
