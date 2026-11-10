import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode2, Terminal, Server, Layers, Cpu } from 'lucide-react';
import { SQL_SERVER_DDL_SCRIPT } from '../../data/schemaData';

interface CodeSnippet {
  id: string;
  name: string;
  project: string;
  summary: string;
  code: string;
}

const BACKEND_FILES: CodeSnippet[] = [
  {
    id: 'invoices-controller',
    name: 'SalesInvoicesController.cs',
    project: 'StartupAccounting.API/Controllers/v1',
    summary: 'ASP.NET Core REST API controller handling invoice drafting, retrieval, and atomic journal posting.',
    code: `using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StartupAccounting.Application.Common.Models;
using StartupAccounting.Application.SalesInvoices.Commands;
using StartupAccounting.Application.SalesInvoices.Queries;

namespace StartupAccounting.API.Controllers.v1;

[ApiController]
[Route("api/v1/sales-invoices")]
[Authorize(Roles = "CompanyAdmin, Accountant, FinanceManager")]
public class SalesInvoicesController : ControllerBase
{
    private readonly ISalesInvoiceService _invoiceService;

    public SalesInvoicesController(ISalesInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedList<SalesInvoiceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInvoices([FromQuery] GetSalesInvoicesQuery query, CancellationToken ct)
    {
        var result = await _invoiceService.GetInvoicesAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var invoice = await _invoiceService.GetByIdAsync(id, ct);
        if (invoice == null) return NotFound();
        return Ok(invoice);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SalesInvoiceDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateDraft([FromBody] CreateSalesInvoiceCommand command, CancellationToken ct)
    {
        var invoiceId = await _invoiceService.CreateDraftAsync(command, ct);
        return CreatedAtAction(nameof(GetById), new { id = invoiceId }, new { invoiceId });
    }

    [HttpPost("{id:guid}/post")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> PostInvoice(Guid id, CancellationToken ct)
    {
        // Executes atomic transaction: marks invoice posted and creates balanced JournalEntry
        var journalEntryId = await _invoiceService.PostInvoiceAsync(id, ct);
        return Ok(new { Message = "Invoice posted to General Ledger", JournalEntryId = journalEntryId });
    }
}
`,
  },
  {
    id: 'posting-service',
    name: 'DoubleEntryPostingService.cs',
    project: 'StartupAccounting.Application/Accounting',
    summary: 'Authoritative transaction orchestrator ensuring strict ACID double-entry invariant equality.',
    code: `using Microsoft.EntityFrameworkCore;
using StartupAccounting.Domain.Entities;
using StartupAccounting.Infrastructure.Persistence;

namespace StartupAccounting.Application.Accounting;

public class DoubleEntryPostingService : IPostingEngine
{
    private readonly AccountingDbContext _context;
    private readonly ITenantContext _tenantContext;

    public DoubleEntryPostingService(AccountingDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> PostSalesInvoiceAsync(Guid invoiceId, string postedByUser, CancellationToken ct)
    {
        // 1. Begin explicit SQL Server database transaction
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        try
        {
            var invoice = await _context.SalesInvoices
                .Include(i => i.Lines)
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId, ct);

            if (invoice == null) throw new InvalidOperationException("Invoice not found.");
            if (invoice.Status != InvoiceStatus.Draft) throw new InvalidOperationException("Invoice is already posted.");

            // 2. Fetch required System Accounts (AR & GST Payable)
            var arAccount = await _context.Accounts
                .FirstAsync(a => a.SystemAccountType == "AccountsReceivable", ct);
            var gstAccount = await _context.Accounts
                .FirstAsync(a => a.SystemAccountType == "GSTPayable", ct);

            var journal = new JournalEntry
            {
                CompanyId = _tenantContext.CompanyId,
                JournalNumber = $"JRN-{DateTime.UtcNow:yyyyMMdd}-{invoice.InvoiceNumber}",
                TransactionDate = invoice.InvoiceDate,
                Description = $"Posting Sales Invoice {invoice.InvoiceNumber}",
                SourceType = JournalSourceType.SalesInvoice,
                SourceId = invoice.InvoiceId,
                Status = JournalStatus.Posted,
                PostedBy = postedByUser,
                PostedAtUtc = DateTimeOffset.UtcNow
            };

            // DR: Accounts Receivable (Grand Total)
            journal.Lines.Add(new JournalEntryLine
            {
                AccountId = arAccount.AccountId,
                DebitAmount = invoice.GrandTotal,
                CreditAmount = 0m,
                Description = $"Accounts Receivable on {invoice.InvoiceNumber}"
            });

            // CR: Revenue Account(s) per line
            foreach (var line in invoice.Lines)
            {
                journal.Lines.Add(new JournalEntryLine
                {
                    AccountId = line.RevenueAccountId,
                    DebitAmount = 0m,
                    CreditAmount = line.SubTotal,
                    Description = line.Description
                });
            }

            // CR: Output GST Payable (Tax Amount)
            if (invoice.TaxAmount > 0)
            {
                journal.Lines.Add(new JournalEntryLine
                {
                    AccountId = gstAccount.AccountId,
                    DebitAmount = 0m,
                    CreditAmount = invoice.TaxAmount,
                    Description = $"Output GST (18%) on {invoice.InvoiceNumber}"
                });
            }

            // 3. Domain invariant balance verification (Debit == Credit)
            journal.ValidateAndBalance();

            _context.JournalEntries.Add(journal);
            invoice.Status = InvoiceStatus.Posted;
            invoice.PostedJournalEntryId = journal.JournalEntryId;
            invoice.PostedAtUtc = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return journal.JournalEntryId;
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }
}
`,
  },
  {
    id: 'reports-service',
    name: 'FinancialReportingService.cs',
    project: 'StartupAccounting.Application/Reports',
    summary: 'Calculates General Ledger running balances, Trial Balance, P&L, and Balance Sheet directly from posted lines.',
    code: `using Microsoft.EntityFrameworkCore;
using StartupAccounting.Domain.Entities;
using StartupAccounting.Infrastructure.Persistence;

namespace StartupAccounting.Application.Reports;

public class FinancialReportingService : IFinancialReportsService
{
    private readonly AccountingDbContext _context;

    public FinancialReportingService(AccountingDbContext context) => _context = context;

    public async Task<TrialBalanceResult> GenerateTrialBalanceAsync(DateOnly asOfDate, CancellationToken ct)
    {
        var accounts = await _context.Accounts.AsNoTracking().ToListAsync(ct);

        // Aggregate debit and credit balances strictly from posted journal lines
        var lineSums = await _context.JournalEntryLines
            .AsNoTracking()
            .Where(l => l.JournalEntry.Status == JournalStatus.Posted && l.JournalEntry.TransactionDate <= asOfDate)
            .GroupBy(l => l.AccountId)
            .Select(g => new
            {
                AccountId = g.Key,
                TotalDebit = g.Sum(l => l.DebitAmount),
                TotalCredit = g.Sum(l => l.CreditAmount)
            })
            .ToDictionaryAsync(x => x.AccountId, ct);

        var rows = accounts.Select(acc =>
        {
            lineSums.TryGetValue(acc.AccountId, out var sum);
            var debit = sum?.TotalDebit ?? 0m;
            var credit = sum?.TotalCredit ?? 0m;

            decimal debitBal = 0m, creditBal = 0m;
            if (acc.NormalBalance == NormalBalance.Debit)
            {
                var net = debit - credit;
                if (net >= 0) debitBal = net; else creditBal = Math.Abs(net);
            }
            else
            {
                var net = credit - debit;
                if (net >= 0) creditBal = net; else debitBal = Math.Abs(net);
            }

            return new TrialBalanceRowDto(acc.AccountCode, acc.AccountName, acc.Category.ToString(), debitBal, creditBal);
        }).ToList();

        var totalDebit = rows.Sum(r => r.DebitBalance);
        var totalCredit = rows.Sum(r => r.CreditBalance);

        return new TrialBalanceResult(rows, totalDebit, totalCredit, Math.Abs(totalDebit - totalCredit) < 0.01m);
    }
}
`,
  },
  {
    id: 'sql-ddl-script',
    name: 'SqlServerSchema_DDL.sql',
    project: 'StartupAccounting.Database',
    summary: 'Idempotent production DDL script with DECIMAL(18,2) precision, indexes, foreign keys, and check constraints.',
    code: SQL_SERVER_DDL_SCRIPT,
  },
];

export const BackendArchitectureView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeSnippet>(BACKEND_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-4 h-4" /> Production .NET 9 & SQL Server Reference Code
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Backend Architecture & Deployment Specifications</h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete ASP.NET Core 9 Web API controllers, application services, ACID transaction orchestrators, and SQL migration scripts.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied to Clipboard!' : `Copy ${selectedFile.name}`}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Navigator (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Backend Source Modules
          </div>

          <div className="space-y-1.5">
            {BACKEND_FILES.map((file) => {
              const isSelected = selectedFile.id === file.id;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all border flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold flex items-center gap-2">
                      <FileCode2 className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      {file.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">{file.project}</div>
                  <span className="text-[11px] text-slate-400 line-clamp-1">{file.summary}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code View (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-white">{selectedFile.name}</span>
            <span className="text-[11px] text-slate-400 font-mono">C# 13 / .NET 9</span>
          </div>

          <div className="p-3 bg-slate-800/30 border-b border-slate-800 text-xs text-slate-300">
            <strong className="text-cyan-300">Component Purpose: </strong> {selectedFile.summary}
          </div>

          <pre className="p-4 bg-slate-950 overflow-x-auto max-h-[600px] font-mono text-xs leading-relaxed text-slate-300">
            {selectedFile.code}
          </pre>
        </div>
      </div>
    </div>
  );
};
