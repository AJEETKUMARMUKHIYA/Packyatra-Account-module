import React from 'react';
import { 
  Layers, 
  ArrowRight, 
  Database, 
  Server, 
  Cpu, 
  ShieldCheck, 
  FileSpreadsheet, 
  Lock, 
  Workflow, 
  CheckCircle,
  FileCheck2
} from 'lucide-react';

export const ArchitectureTab: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-700/60 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Layers className="w-4 h-4" /> Architectural Blueprint & Layer Decoupling
        </div>
        <h2 className="text-2xl font-bold text-white mt-1">Clean Architecture Modular Monolith</h2>
        <p className="text-slate-300 text-sm mt-2 leading-relaxed max-w-4xl">
          Following domain-driven design (DDD) and Clean Architecture principles, business rules and accounting invariance live at the core 
          (<strong>StartupAccounting.Domain</strong>), with zero dependencies on external databases or UI frameworks. 
          The infrastructure layer encapsulates Microsoft SQL Server 2022 via Entity Framework Core 9.
        </p>
      </div>

      {/* Layer Hierarchy Visual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Layer 1: API */}
        <div className="bg-slate-900/90 border-2 border-indigo-500/30 rounded-xl p-5 hover:border-indigo-500/60 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-semibold">
                Outer Layer
              </span>
              <Server className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="font-bold text-slate-100 text-base mt-3">StartupAccounting.API</h3>
            <p className="text-xs text-slate-400 mt-2">
              ASP.NET Core 9 Web API controllers, JWT / cookie middleware, OpenAPI/Swagger, global exception handler, rate limiting.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>• Controllers (Invoices, Journals, Accounts)</div>
              <div>• Serilog structured request logging</div>
              <div>• Tenant resolution middleware</div>
            </div>
          </div>
          <div className="mt-4 text-[11px] text-indigo-400 flex items-center gap-1 font-semibold">
            Calls Application Layer <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Layer 2: Application */}
        <div className="bg-slate-900/90 border-2 border-cyan-500/30 rounded-xl p-5 hover:border-cyan-500/60 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-semibold">
                Use Cases & CQRS
              </span>
              <Workflow className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="font-bold text-slate-100 text-base mt-3">StartupAccounting.Application</h3>
            <p className="text-xs text-slate-400 mt-2">
              Use cases, MediatR command handlers, DTOs, FluentValidation rules, and financial transaction orchestration.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>• PostInvoiceCommandHandler</div>
              <div>• RecordPaymentCommandHandler</div>
              <div>• FluentValidation rules for monetary lines</div>
            </div>
          </div>
          <div className="mt-4 text-[11px] text-cyan-400 flex items-center gap-1 font-semibold">
            Orchestrates Domain & DB <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Layer 3: Domain (The Core) */}
        <div className="bg-slate-900/90 border-2 border-emerald-500/50 rounded-xl p-5 hover:border-emerald-500/80 transition-all shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">
                Core (Pure Domain)
              </span>
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-bold text-emerald-300 text-base mt-3">StartupAccounting.Domain</h3>
            <p className="text-xs text-slate-400 mt-2">
              Entities, Aggregates, Enums, and Accounting Invariant Rules. Strictly zero external NuGet package dependencies.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div>• Mandatory: Debit == Credit</div>
              <div>• Non-negative journal lines</div>
              <div>• Reversal-only corrections</div>
              <div>• Accounting equation invariance</div>
            </div>
          </div>
          <div className="mt-4 text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            Independent of any framework <CheckCircle className="w-3 h-3" />
          </div>
        </div>

        {/* Layer 4: Infrastructure */}
        <div className="bg-slate-900/90 border-2 border-purple-500/30 rounded-xl p-5 hover:border-purple-500/60 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-semibold">
                Persistence & External
              </span>
              <Database className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-bold text-slate-100 text-base mt-3">StartupAccounting.Infrastructure</h3>
            <p className="text-xs text-slate-400 mt-2">
              Entity Framework Core 9 DbContext, SQL Server 2022 configurations, Fluent API schema mappings, QuestPDF renderer.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>• AccountingDbContext (Decimal 18,2)</div>
              <div>• Multi-tenant Global Query Filters</div>
              <div>• EF Core Code-First Migrations</div>
            </div>
          </div>
          <div className="mt-4 text-[11px] text-purple-400 flex items-center gap-1 font-semibold">
            Implements Repositories <CheckCircle className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Double-Entry Transaction Flowchart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          <Workflow className="w-5 h-5 text-indigo-400" /> Double-Entry Accounting Posting Lifecycle (Atomic Execution)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          How commercial events (Sales Invoices, Vendor Bills, Customer Receipts) convert to permanent ledger records.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* Step 1 */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center mb-2">1</div>
            <div className="font-semibold text-xs text-white">Commercial Document</div>
            <p className="text-[11px] text-slate-400 mt-1">
              User creates a Draft Sales Invoice (e.g. ₹50k + ₹9k GST) or Vendor Bill.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center mb-2">2</div>
            <div className="font-semibold text-xs text-white">Atomic Transaction</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Backend begins SQL Server transaction with Idempotency Key check.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-emerald-500/50 bg-emerald-950/20">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center mb-2">3</div>
            <div className="font-semibold text-xs text-emerald-300">Journal Creation</div>
            <p className="text-[11px] text-slate-300 mt-1">
              Accounting engine creates JournalEntry + Lines. Enforces Debit == Credit.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center mb-2">4</div>
            <div className="font-semibold text-xs text-white">Commit & Audit</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Status set to Posted; audit log entry recorded; DB transaction commits.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-purple-500/40 bg-purple-950/20">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center mb-2">5</div>
            <div className="font-semibold text-xs text-purple-300">Reporting Engine</div>
            <p className="text-[11px] text-slate-300 mt-1">
              Trial Balance, P&L, Balance Sheet, and Customer Aging reflect new state.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Multi-Tenant Isolation Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" /> Multi-Tenant Data Isolation Strategy
          </h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Every table (Customers, Accounts, Invoices, JournalEntries, Payments) has a non-nullable foreign key to <code>CompanyId</code>. 
            In the ASP.NET Core backend:
          </p>
          <ul className="mt-3 space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Tenant Context Provider:</strong> Injected scoped service extracts the authenticated user's CompanyId claim from JWT.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>EF Core Global Query Filters:</strong> Automatically appends <code>WHERE CompanyId = @CurrentCompanyId</code> to every generated SQL query.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Save Interceptor:</strong> Overrides <code>SaveChangesAsync</code> to guarantee that new entities are automatically stamped with the tenant's CompanyId.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Accounting Invariance & Anti-Tamper Rules
          </h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Guarantees required by financial auditors and compliance bodies:
          </p>
          <ul className="mt-3 space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">✓</span>
              <span><strong>Zero Silent Deletes:</strong> Journal entries with Status = 'Posted' cannot be deleted or edited. Corrections occur strictly via offsetting reversal journals.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">✓</span>
              <span><strong>Double-Check at Database Level:</strong> Check constraints on SQL Server table <code>CK_JournalEntries_Balanced</code> verify that TotalDebit == TotalCredit.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">✓</span>
              <span><strong>Decimal 18,2 Precision:</strong> Avoids rounding anomalies and IEEE-754 binary floating point precision leakage.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
