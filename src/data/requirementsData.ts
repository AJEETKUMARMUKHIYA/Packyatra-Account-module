export interface RequirementItem {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'High' | 'Critical' | 'Medium';
  phase: string;
}

export const FUNCTIONAL_REQUIREMENTS: RequirementItem[] = [
  {
    id: 'FR-01',
    category: 'Tenant & Company Setup',
    title: 'Multi-Tenant Company Onboarding & Fiscal Configuration',
    description: 'Create and configure company legal entity, GSTIN/PAN, default currency (INR/USD), 12-month fiscal calendar (e.g. April-March), and automated invoice numbering series with atomic sequence counters.',
    priority: 'Critical',
    phase: 'Phase 1 & 5',
  },
  {
    id: 'FR-02',
    category: 'Identity & Access Control',
    title: 'Role-Based Access Control (RBAC) & Company Isolation',
    description: 'Enforce 6 standard roles (Super Admin, Company Admin, Accountant, Finance Manager, Employee, Auditor). Ensure employees cannot access confidential ledger/balance sheets and restrict queries to the tenant CompanyId.',
    priority: 'Critical',
    phase: 'Phase 4',
  },
  {
    id: 'FR-03',
    category: 'Chart of Accounts',
    title: 'Hierarchical 5-Category Chart of Accounts',
    description: 'Define Assets, Liabilities, Equity, Revenue, and Expenses with parent-child nesting, account codes, normal balance orientation, and protected System Accounts (AR, AP, Retained Earnings, GST). Prevent deletion of accounts with posted lines.',
    priority: 'Critical',
    phase: 'Phase 6',
  },
  {
    id: 'FR-04',
    category: 'Commercial Masters',
    title: 'Customer and Vendor Directory with Tax Rules',
    description: 'Manage customers and suppliers with validated GSTIN/PAN, billing/shipping addresses, default credit days, and dynamic ledger balance tracking. Prohibit arbitrary manual overrides of calculated balances.',
    priority: 'High',
    phase: 'Phase 7',
  },
  {
    id: 'FR-05',
    category: 'Sales Invoicing',
    title: 'Authoritative Invoicing with Configurable Tax Engine',
    description: 'Draft, validate, and post sales invoices with line-item discounts, GST tax calculation (CGST+SGST for intra-state, IGST for inter-state), automated PDF rendering, and overdue tracking.',
    priority: 'Critical',
    phase: 'Phase 8',
  },
  {
    id: 'FR-06',
    category: 'Vendor Bills & Expenses',
    title: 'Vendor Bill Processing & Operational Expenses',
    description: 'Capture supplier invoices with duplicate invoice number detection, input tax credit eligibility, expense classification, and multi-tier approval flows for corporate reimbursements.',
    priority: 'High',
    phase: 'Phase 9',
  },
  {
    id: 'FR-07',
    category: 'Accounting Engine',
    title: 'Atomic Double-Entry Posting Engine',
    description: 'Automatically generate balanced Journal Entries upon posting invoices, bills, payments, and expenses. Strictly enforce Debit == Credit, non-negative amounts, and zero editing of posted records (reversal entries only).',
    priority: 'Critical',
    phase: 'Phase 10',
  },
  {
    id: 'FR-08',
    category: 'Settlements & Allocations',
    title: 'Customer Receipts & Vendor Payments with Document Allocation',
    description: 'Record bank transfers, cheques, and UPI receipts; allocate payments across one or multiple invoices; maintain partial payment tracking and prevent over-allocation.',
    priority: 'Critical',
    phase: 'Phase 11',
  },
  {
    id: 'FR-09',
    category: 'Financial Statements',
    title: 'General Ledger, Trial Balance, P&L, and Balance Sheet',
    description: 'Produce real-time financial statements derived from posted journal lines. Trial balance must balance debit = credit. Balance sheet must satisfy: Assets = Liabilities + Equity.',
    priority: 'Critical',
    phase: 'Phase 12',
  },
  {
    id: 'FR-10',
    category: 'Banking & Treasury',
    title: 'Bank Account Management & Reconciliation',
    description: 'Track multiple company bank accounts, handle internal transfers without classifying them as revenues/expenses, import bank statements, and match cleared transactions.',
    priority: 'High',
    phase: 'Phase 13',
  },
  {
    id: 'FR-11',
    category: 'Governance & Security',
    title: 'Tamper-Evident Audit Trail & Period Closing',
    description: 'Log all security logins, invoice postings, payment reversals, and permission adjustments with user ID, correlation ID, timestamp, and entity snapshot.',
    priority: 'High',
    phase: 'Phase 14',
  },
];

export const NON_FUNCTIONAL_REQUIREMENTS: RequirementItem[] = [
  {
    id: 'NFR-01',
    category: 'Data Integrity & Precision',
    title: 'Strict Monetary Precision (DECIMAL(18,2))',
    description: 'Never use floating-point types (FLOAT/DOUBLE) for financial calculations. Use exact 128-bit decimal arithmetic in C# and DECIMAL(18,2) in SQL Server to avoid floating-point drift.',
    priority: 'Critical',
    phase: 'Phase 1',
  },
  {
    id: 'NFR-02',
    category: 'Transactional Atomicity',
    title: 'ACID Transactional Consistency (DB Transactions)',
    description: 'Posting transactions (e.g. Sales Invoice + Journal Entry + Journal Lines + Balance updates) must execute inside an explicit SQL Server transaction. If any line fails, roll back completely.',
    priority: 'Critical',
    phase: 'Phase 1 & 10',
  },
  {
    id: 'NFR-03',
    category: 'Immutability & Auditability',
    title: 'Ledger Immutability & Reversal Workflow',
    description: 'No DELETE or direct UPDATE queries permitted on posted Journal Entries or Journal Lines. Corrections must be handled by posting a new, offsetting Reversal Journal.',
    priority: 'Critical',
    phase: 'Phase 1 & 10',
  },
  {
    id: 'NFR-04',
    category: 'Multi-Tenant Isolation',
    title: 'Company Data Isolation & Row-Level Security',
    description: 'Every SQL table includes CompanyId. EF Core uses global query filters to ensure authenticated users never see or modify records from another organization.',
    priority: 'Critical',
    phase: 'Phase 2 & 4',
  },
  {
    id: 'NFR-05',
    category: 'Concurrency Control',
    title: 'Optimistic Concurrency with RowVersion Tokens',
    description: 'Key tables (Companies, Accounts, Invoices) use ROWVERSION / byte[] ConcurrencyCheck to detect and reject conflicting simultaneous edits gracefully.',
    priority: 'High',
    phase: 'Phase 2',
  },
  {
    id: 'NFR-06',
    category: 'Scalability & Performance',
    title: 'Sub-200ms Financial Query Latency',
    description: 'Optimized composite covering indexes on (CompanyId, TransactionDate) and (CompanyId, AccountId) ensure general ledger and trial balance queries execute under 200ms for 100k+ rows.',
    priority: 'High',
    phase: 'Phase 1 & 12',
  },
  {
    id: 'NFR-07',
    category: 'Idempotency',
    title: 'Idempotent Posting & Duplicate Protection',
    description: 'Unique constraints on (CompanyId, InvoiceNumber) and (CompanyId, JournalNumber) alongside client-supplied Idempotency-Key headers prevent double-posting from network retries.',
    priority: 'Critical',
    phase: 'Phase 8 & 10',
  },
];

export const NUGET_PACKAGES = [
  { name: 'Microsoft.EntityFrameworkCore.SqlServer', version: '9.0.0', project: 'Infrastructure', purpose: 'SQL Server database provider for EF Core' },
  { name: 'Microsoft.EntityFrameworkCore.Tools', version: '9.0.0', project: 'Infrastructure', purpose: 'CLI migrations and scaffolding tools' },
  { name: 'Microsoft.EntityFrameworkCore.Design', version: '9.0.0', project: 'API / Infrastructure', purpose: 'Design-time compilation for migrations' },
  { name: 'Microsoft.AspNetCore.Identity.EntityFrameworkCore', version: '9.0.0', project: 'Infrastructure', purpose: 'Identity membership and role-based storage' },
  { name: 'Microsoft.AspNetCore.Authentication.JwtBearer', version: '9.0.0', project: 'API', purpose: 'JWT token validation and authorization schemes' },
  { name: 'FluentValidation.AspNetCore', version: '11.3.0', project: 'Application', purpose: 'Robust business validation for DTOs and commands' },
  { name: 'MediatR', version: '12.4.1', project: 'Application', purpose: 'In-process mediator for CQRS commands and queries' },
  { name: 'Swashbuckle.AspNetCore', version: '6.9.0', project: 'API', purpose: 'OpenAPI 3.0 documentation and Swagger UI' },
  { name: 'Serilog.AspNetCore', version: '8.0.3', project: 'API', purpose: 'Structured JSON logging with request correlation IDs' },
  { name: 'QuestPDF', version: '2024.10.1', project: 'Infrastructure', purpose: 'Fluent code-first generation of PDF invoices and reports' },
  { name: 'xunit', version: '2.9.2', project: 'Tests', purpose: 'Modern unit and integration testing engine' },
  { name: 'FluentAssertions', version: '6.12.2', project: 'Tests', purpose: 'Readable assertion syntax for accounting invariant tests' },
  { name: 'Moq', version: '4.20.72', project: 'Tests', purpose: 'Mocking framework for dependencies in unit tests' },
];

export const CLI_COMMANDS = [
  {
    step: '1. Solution & Project Scaffolding',
    command: `# 1. Create Solution
dotnet new sln -n StartupAccounting

# 2. Create Projects (Clean Architecture Layers)
dotnet new webapi -n StartupAccounting.API -f net9.0
dotnet new classlib -n StartupAccounting.Application -f net9.0
dotnet new classlib -n StartupAccounting.Domain -f net9.0
dotnet new classlib -n StartupAccounting.Infrastructure -f net9.0
dotnet new xunit -n StartupAccounting.Tests -f net9.0

# 3. Add Projects to Solution
dotnet sln add StartupAccounting.API/StartupAccounting.API.csproj
dotnet sln add StartupAccounting.Application/StartupAccounting.Application.csproj
dotnet sln add StartupAccounting.Domain/StartupAccounting.Domain.csproj
dotnet sln add StartupAccounting.Infrastructure/StartupAccounting.Infrastructure.csproj
dotnet sln add StartupAccounting.Tests/StartupAccounting.Tests.csproj
`,
  },
  {
    step: '2. Project Dependencies & References',
    command: `# Domain has 0 external dependencies (pure business rules)
# Application references Domain
dotnet add StartupAccounting.Application/StartupAccounting.Application.csproj reference StartupAccounting.Domain/StartupAccounting.Domain.csproj

# Infrastructure references Domain & Application
dotnet add StartupAccounting.Infrastructure/StartupAccounting.Infrastructure.csproj reference StartupAccounting.Domain/StartupAccounting.Domain.csproj
dotnet add StartupAccounting.Infrastructure/StartupAccounting.Infrastructure.csproj reference StartupAccounting.Application/StartupAccounting.Application.csproj

# API references Application & Infrastructure
dotnet add StartupAccounting.API/StartupAccounting.API.csproj reference StartupAccounting.Application/StartupAccounting.Application.csproj
dotnet add StartupAccounting.API/StartupAccounting.API.csproj reference StartupAccounting.Infrastructure/StartupAccounting.Infrastructure.csproj

# Tests references all layers
dotnet add StartupAccounting.Tests/StartupAccounting.Tests.csproj reference StartupAccounting.Domain/StartupAccounting.Domain.csproj
dotnet add StartupAccounting.Tests/StartupAccounting.Tests.csproj reference StartupAccounting.Application/StartupAccounting.Application.csproj
dotnet add StartupAccounting.Tests/StartupAccounting.Tests.csproj reference StartupAccounting.Infrastructure/StartupAccounting.Infrastructure.csproj
`,
  },
  {
    step: '3. Package Installations',
    command: `# Infrastructure Packages
cd StartupAccounting.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 9.0.0
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 9.0.0
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore --version 9.0.0
dotnet add package QuestPDF --version 2024.10.1
cd ..

# Application Packages
cd StartupAccounting.Application
dotnet add package FluentValidation.AspNetCore --version 11.3.0
dotnet add package MediatR --version 12.4.1
cd ..

# API Packages
cd StartupAccounting.API
dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.0
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 9.0.0
dotnet add package Swashbuckle.AspNetCore --version 6.9.0
dotnet add package Serilog.AspNetCore --version 8.0.3
cd ..

# Test Packages
cd StartupAccounting.Tests
dotnet add package FluentAssertions --version 6.12.2
dotnet add package Moq --version 4.20.72
dotnet add package Microsoft.EntityFrameworkCore.InMemory --version 9.0.0
cd ..
`,
  },
  {
    step: '4. Database Migration Execution',
    command: `# Generate Initial EF Core Migration
dotnet ef migrations add InitialAccountingSchema \\
    --project StartupAccounting.Infrastructure \\
    --startup-project StartupAccounting.API \\
    --output-dir Persistence/Migrations

# Apply Migration to SQL Server Instance
dotnet ef database update \\
    --project StartupAccounting.Infrastructure \\
    --startup-project StartupAccounting.API

# Optional: Generate idempotent raw SQL deployment script for DBAs
dotnet ef migrations script --idempotent \\
    --project StartupAccounting.Infrastructure \\
    --startup-project StartupAccounting.API \\
    --output InitialSchema.sql
`,
  },
];
