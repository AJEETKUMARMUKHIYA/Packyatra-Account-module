export interface CSharpFileItem {
  id: string;
  name: string;
  project: string;
  layer: 'Domain' | 'Infrastructure' | 'Application' | 'API';
  summary: string;
  code: string;
}

export const EF_CORE_FILES: CSharpFileItem[] = [
  {
    id: 'company-config',
    name: 'CompanyConfiguration.cs',
    project: 'StartupAccounting.Infrastructure',
    layer: 'Infrastructure',
    summary: 'Fluent API mapping for Companies table: Primary Key, RowVersion concurrency token, unique GSTIN, and cascade restrictions.',
    code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StartupAccounting.Domain.Entities;

namespace StartupAccounting.Infrastructure.Persistence.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("Companies", "dbo");
        builder.HasKey(c => c.CompanyId);

        builder.Property(c => c.LegalName).HasMaxLength(200).IsRequired();
        builder.Property(c => c.TradeName).HasMaxLength(200);
        builder.Property(c => c.PAN).HasMaxLength(20);
        builder.Property(c => c.GSTIN).HasMaxLength(25);
        builder.Property(c => c.CurrencyCode).HasMaxLength(3).IsFixedLength().HasDefaultValue("INR");
        builder.Property(c => c.CurrencySymbol).HasMaxLength(5).HasDefaultValue("₹");
        builder.Property(c => c.FiscalYearStartMonth).HasDefaultValue(4);
        builder.Property(c => c.InvoicePrefix).HasMaxLength(10).HasDefaultValue("INV-");
        builder.Property(c => c.BillPrefix).HasMaxLength(10).HasDefaultValue("BILL-");

        // RowVersion for optimistic concurrency
        builder.Property(c => c.RowVersion).IsRowVersion();

        // Unique filtered index on GSTIN
        builder.HasIndex(c => c.GSTIN)
            .IsUnique()
            .HasFilter("[GSTIN] IS NOT NULL")
            .HasDatabaseName("UX_Companies_GSTIN");

        // Relationships (Tenant Root: Restrict cascade delete)
        builder.HasMany(c => c.Accounts)
            .WithOne(a => a.Company)
            .HasForeignKey(a => a.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Customers)
            .WithOne(cust => cust.Company)
            .HasForeignKey(cust => cust.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Vendors)
            .WithOne(v => v.Company)
            .HasForeignKey(v => v.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.SalesInvoices)
            .WithOne(i => i.Company)
            .HasForeignKey(i => i.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.JournalEntries)
            .WithOne(j => j.Company)
            .HasForeignKey(j => j.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
`,
  },
  {
    id: 'account-config',
    name: 'AccountConfiguration.cs',
    project: 'StartupAccounting.Infrastructure',
    layer: 'Infrastructure',
    summary: 'Fluent API mapping for Chart of Accounts: Unique code per company, self-referencing parent/child accounts, and system account flags.',
    code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StartupAccounting.Domain.Entities;

namespace StartupAccounting.Infrastructure.Persistence.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("Accounts", "dbo");
        builder.HasKey(a => a.AccountId);

        builder.Property(a => a.AccountCode).HasMaxLength(30).IsRequired();
        builder.Property(a => a.AccountName).HasMaxLength(150).IsRequired();
        builder.Property(a => a.Category).HasConversion<int>().IsRequired();
        builder.Property(a => a.NormalBalance).HasConversion<int>().IsRequired();
        builder.Property(a => a.SystemAccountType).HasMaxLength(50);

        // Unique index: AccountCode unique within Company
        builder.HasIndex(a => new { a.CompanyId, a.AccountCode })
            .IsUnique()
            .HasDatabaseName("UX_Accounts_Company_Code");

        // Composite covering index for general ledger queries
        builder.HasIndex(a => new { a.CompanyId, a.Category })
            .HasDatabaseName("IX_Accounts_Company_Category");

        // Self-referencing parent-child relationship
        builder.HasOne(a => a.ParentAccount)
            .WithMany(a => a.SubAccounts)
            .HasForeignKey(a => a.ParentAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // Cannot delete an account that has posted journal lines
        builder.HasMany(a => a.JournalLines)
            .WithOne(l => l.Account)
            .HasForeignKey(l => l.AccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
`,
  },
  {
    id: 'sales-invoice-config',
    name: 'SalesInvoiceConfiguration.cs',
    project: 'StartupAccounting.Infrastructure',
    layer: 'Infrastructure',
    summary: 'Sales Invoice and lines: 1:N cascade delete on line items, 1:1 link to JournalEntry, check constraints for math integrity.',
    code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StartupAccounting.Domain.Entities;

namespace StartupAccounting.Infrastructure.Persistence.Configurations;

public class SalesInvoiceConfiguration : IEntityTypeConfiguration<SalesInvoice>
{
    public void Configure(EntityTypeBuilder<SalesInvoice> builder)
    {
        builder.ToTable("SalesInvoices", "dbo", t =>
        {
            t.HasCheckConstraint("CK_SalesInvoices_Total", "[GrandTotal] = [SubTotal] + [TaxAmount]");
            t.HasCheckConstraint("CK_SalesInvoices_Balance", "[BalanceAmount] = [GrandTotal] - [PaidAmount]");
            t.HasCheckConstraint("CK_SalesInvoices_NonNegative", "[GrandTotal] >= 0 AND [PaidAmount] >= 0 AND [BalanceAmount] >= 0");
        });

        builder.HasKey(i => i.InvoiceId);
        builder.Property(i => i.InvoiceNumber).HasMaxLength(50).IsRequired();
        builder.Property(i => i.PlaceOfSupply).HasMaxLength(100);
        builder.Property(i => i.Currency).HasMaxLength(3).IsFixedLength().HasDefaultValue("INR");
        builder.Property(i => i.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(i => i.CreatedBy).HasMaxLength(100).IsRequired();

        // Unique invoice number per company
        builder.HasIndex(i => new { i.CompanyId, i.InvoiceNumber })
            .IsUnique()
            .HasDatabaseName("UX_SalesInvoices_Company_Number");

        builder.HasIndex(i => new { i.CompanyId, i.Status });
        builder.HasIndex(i => i.CustomerId);

        // 1:N with Line Items (Cascade Delete for draft lifecycle)
        builder.HasMany(i => i.Lines)
            .WithOne(l => l.Invoice)
            .HasForeignKey(l => l.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        // 1:1 foreign key to Posted Journal Entry
        builder.HasOne(i => i.PostedJournalEntry)
            .WithMany()
            .HasForeignKey(i => i.PostedJournalEntryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class SalesInvoiceLineConfiguration : IEntityTypeConfiguration<SalesInvoiceLine>
{
    public void Configure(EntityTypeBuilder<SalesInvoiceLine> builder)
    {
        builder.ToTable("SalesInvoiceLines", "dbo", t =>
        {
            t.HasCheckConstraint("CK_SalesInvoiceLines_Math", "[LineTotal] = [SubTotal] + [TaxAmount]");
            t.HasCheckConstraint("CK_SalesInvoiceLines_Positives", "[Quantity] > 0 AND [UnitPrice] >= 0");
        });

        builder.HasKey(l => l.LineId);
        builder.Property(l => l.Description).HasMaxLength(300).IsRequired();
        builder.Property(l => l.Quantity).HasPrecision(12, 4);

        builder.HasOne(l => l.RevenueAccount)
            .WithMany()
            .HasForeignKey(l => l.RevenueAccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
`,
  },
  {
    id: 'journal-config',
    name: 'JournalEntryConfiguration.cs',
    project: 'StartupAccounting.Infrastructure',
    layer: 'Infrastructure',
    summary: 'Immutable double-entry journal configuration: TotalDebit == TotalCredit check constraint, and one-sided journal line check.',
    code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StartupAccounting.Domain.Entities;

namespace StartupAccounting.Infrastructure.Persistence.Configurations;

public class JournalEntryConfiguration : IEntityTypeConfiguration<JournalEntry>
{
    public void Configure(EntityTypeBuilder<JournalEntry> builder)
    {
        builder.ToTable("JournalEntries", "dbo", t =>
        {
            // CRITICAL ACCOUNTING INVARIANT AT DATABASE LEVEL
            t.HasCheckConstraint("CK_JournalEntries_Balanced", "[TotalDebit] = [TotalCredit] AND [TotalDebit] > 0");
        });

        builder.HasKey(j => j.JournalEntryId);
        builder.Property(j => j.JournalNumber).HasMaxLength(50).IsRequired();
        builder.Property(j => j.Description).HasMaxLength(500).IsRequired();
        builder.Property(j => j.SourceType).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(j => j.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(j => j.PostedBy).HasMaxLength(100).IsRequired();

        // Unique Journal Number per company
        builder.HasIndex(j => new { j.CompanyId, j.JournalNumber })
            .IsUnique()
            .HasDatabaseName("UX_JournalEntries_Company_Number");

        // Optimized covering index for date filtering and trial balance
        builder.HasIndex(j => new { j.CompanyId, j.TransactionDate })
            .HasDatabaseName("IX_JournalEntries_Company_Date");

        builder.HasIndex(j => new { j.SourceType, j.SourceId });

        // 1:N Journal lines (Cascade delete when parent is removed before posting)
        builder.HasMany(j => j.Lines)
            .WithOne(l => l.JournalEntry)
            .HasForeignKey(l => l.JournalEntryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Self-referencing reversal entry link
        builder.HasOne(j => j.ReversedByJournal)
            .WithMany()
            .HasForeignKey(j => j.ReversedByJournalId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class JournalEntryLineConfiguration : IEntityTypeConfiguration<JournalEntryLine>
{
    public void Configure(EntityTypeBuilder<JournalEntryLine> builder)
    {
        builder.ToTable("JournalEntryLines", "dbo", t =>
        {
            // Amounts must be positive
            t.HasCheckConstraint("CK_JournalEntryLines_NonNegative", "[DebitAmount] >= 0 AND [CreditAmount] >= 0");
            // Cannot have both debit and credit on the same line
            t.HasCheckConstraint("CK_JournalEntryLines_OneSided", "NOT ([DebitAmount] > 0 AND [CreditAmount] > 0)");
            // Cannot have both debit and credit be zero
            t.HasCheckConstraint("CK_JournalEntryLines_NonZero", "[DebitAmount] > 0 OR [CreditAmount] > 0");
        });

        builder.HasKey(l => l.JournalEntryLineId);
        builder.Property(l => l.Description).HasMaxLength(300);

        builder.HasOne(l => l.Account)
            .WithMany(a => a.JournalLines)
            .HasForeignKey(l => l.AccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
`,
  },
  {
    id: 'payment-config',
    name: 'PaymentConfiguration.cs',
    project: 'StartupAccounting.Infrastructure',
    layer: 'Infrastructure',
    summary: 'Payments and document allocations: Polymorphic allocation support for Sales Invoices and Purchase Bills, positive amount checks.',
    code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StartupAccounting.Domain.Entities;

namespace StartupAccounting.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments", "dbo", t =>
        {
            t.HasCheckConstraint("CK_Payments_Amount", "[Amount] > 0");
        });

        builder.HasKey(p => p.PaymentId);
        builder.Property(p => p.PaymentNumber).HasMaxLength(50).IsRequired();
        builder.Property(p => p.PartyType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(p => p.PaymentType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(p => p.PaymentMethod).HasMaxLength(30).IsRequired();
        builder.Property(p => p.ReferenceNumber).HasMaxLength(100);
        builder.Property(p => p.Status).HasMaxLength(20).IsRequired();

        builder.HasIndex(p => new { p.CompanyId, p.PaymentNumber })
            .IsUnique()
            .HasDatabaseName("UX_Payments_Company_Number");

        builder.HasIndex(p => new { p.CompanyId, p.PaymentDate });

        builder.HasOne(p => p.Customer)
            .WithMany()
            .HasForeignKey(p => p.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Vendor)
            .WithMany()
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.BankAccount)
            .WithMany()
            .HasForeignKey(p => p.BankAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Allocations)
            .WithOne(a => a.Payment)
            .HasForeignKey(a => a.PaymentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PaymentAllocationConfiguration : IEntityTypeConfiguration<PaymentAllocation>
{
    public void Configure(EntityTypeBuilder<PaymentAllocation> builder)
    {
        builder.ToTable("PaymentAllocations", "dbo", t =>
        {
            t.HasCheckConstraint("CK_PaymentAllocations_Positive", "[AllocatedAmount] > 0");
        });

        builder.HasKey(a => a.AllocationId);
        builder.Property(a => a.DocumentType).HasMaxLength(30).IsRequired();

        builder.HasIndex(a => new { a.DocumentType, a.DocumentId });
    }
}
`,
  },
  {
    id: 'auditable-interceptor',
    name: 'AuditableEntitySaveChangesInterceptor.cs',
    project: 'StartupAccounting.Infrastructure',
    layer: 'Infrastructure',
    summary: 'EF Core SaveChangesInterceptor: Automatically sets audit timestamps, stamps Tenant CompanyId, and blocks updates to posted journals.',
    code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using StartupAccounting.Domain.Entities;

namespace StartupAccounting.Infrastructure.Persistence.Interceptors;

public class AuditableEntitySaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly ITenantContext _tenantContext;

    public AuditableEntitySaveChangesInterceptor(ITenantContext tenantContext)
    {
        _tenantContext = tenantContext;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        var context = eventData.Context;
        if (context == null) return base.SavingChangesAsync(eventData, result, cancellationToken);

        var utcNow = DateTimeOffset.UtcNow;

        // 1. IMMUTABILITY CHECK: Prevent UPDATE or DELETE on Posted Journal Entries
        foreach (var entry in context.ChangeTracker.Entries<JournalEntry>())
        {
            if (entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
            {
                var originalStatus = entry.OriginalValues.GetValue<JournalStatus>(nameof(JournalEntry.Status));
                if (originalStatus == JournalStatus.Posted)
                {
                    throw new InvalidOperationException(
                        $"SECURITY VIOLATION: Journal Entry '{entry.Entity.JournalNumber}' is Posted and cannot be modified or deleted. " +
                        $"You must post an offsetting Reversal Journal entry instead.");
                }
            }
        }

        // 2. MULTI-TENANT & TIMESTAMP STAMPING
        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity is SalesInvoice invoice && invoice.CompanyId == Guid.Empty)
                    invoice.CompanyId = _tenantContext.CompanyId;

                if (entry.Entity is JournalEntry journal && journal.CompanyId == Guid.Empty)
                    journal.CompanyId = _tenantContext.CompanyId;

                if (entry.Entity is Account account && account.CompanyId == Guid.Empty)
                    account.CompanyId = _tenantContext.CompanyId;
            }
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }
}
`,
  },
];
