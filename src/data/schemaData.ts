import { TableDefinition } from '../types';

export const SCHEMA_TABLES: TableDefinition[] = [
  {
    name: 'Companies',
    category: 'Security & Tenant',
    description: 'Tenant master record storing organization identity, currency, financial year settings, tax registration, and numbering configuration.',
    columns: [
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true, notes: 'PRIMARY KEY (Default NEWSEQUENTIALID())' },
      { name: 'LegalName', type: 'NVARCHAR(200)', nullable: false, notes: 'Registered business name' },
      { name: 'TradeName', type: 'NVARCHAR(200)', nullable: true, notes: 'Doing business as (DBA)' },
      { name: 'PAN', type: 'NVARCHAR(20)', nullable: true, notes: 'Permanent Account Number' },
      { name: 'GSTIN', type: 'NVARCHAR(25)', nullable: true, notes: 'Goods and Services Tax ID' },
      { name: 'CurrencyCode', type: 'CHAR(3)', nullable: false, notes: 'Default: INR or USD' },
      { name: 'CurrencySymbol', type: 'NVARCHAR(5)', nullable: false, notes: 'Default: ₹ or $' },
      { name: 'FiscalYearStartMonth', type: 'INT', nullable: false, notes: '1 for Jan, 4 for Apr (India standard)' },
      { name: 'InvoicePrefix', type: 'NVARCHAR(10)', nullable: false, notes: 'e.g. INV-' },
      { name: 'NextInvoiceNumber', type: 'INT', nullable: false, notes: 'Atomic sequence tracker' },
      { name: 'BillPrefix', type: 'NVARCHAR(10)', nullable: false, notes: 'e.g. BILL-' },
      { name: 'NextBillNumber', type: 'INT', nullable: false, notes: 'Sequence counter' },
      { name: 'IsActive', type: 'BIT', nullable: false, notes: 'Default 1' },
      { name: 'CreatedAtUtc', type: 'DATETIMEOFFSET', nullable: false, notes: 'Audit timestamp' },
      { name: 'UpdatedAtUtc', type: 'DATETIMEOFFSET', nullable: true, notes: 'Last modified timestamp' },
      { name: 'RowVersion', type: 'ROWVERSION', nullable: false, notes: 'Optimistic concurrency control' },
    ],
    indexes: [
      'PK_Companies (CompanyId)',
      'UX_Companies_GSTIN (GSTIN) WHERE GSTIN IS NOT NULL',
    ],
    businessRules: [
      'Multi-tenant root entity; every transactional and master table holds a foreign key to CompanyId.',
      'Sequential number generation must use atomic transactions to prevent duplicate invoice numbers.',
      'RowVersion prevents concurrent configuration overwrites.',
    ],
  },
  {
    name: 'ApplicationUsers',
    category: 'Security & Tenant',
    description: 'Identity table integrated with ASP.NET Core Identity for authentication and company scoping.',
    columns: [
      { name: 'UserId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: true, isFk: true, fkRef: 'Companies(CompanyId)', notes: 'NULL for global Super Admin' },
      { name: 'Email', type: 'NVARCHAR(256)', nullable: false },
      { name: 'NormalizedEmail', type: 'NVARCHAR(256)', nullable: false },
      { name: 'FullName', type: 'NVARCHAR(150)', nullable: false },
      { name: 'PasswordHash', type: 'NVARCHAR(MAX)', nullable: false },
      { name: 'Role', type: 'NVARCHAR(50)', nullable: false, notes: 'SuperAdmin, CompanyAdmin, Accountant, FinanceManager, Employee, Auditor' },
      { name: 'IsActive', type: 'BIT', nullable: false },
      { name: 'LockoutEnd', type: 'DATETIMEOFFSET', nullable: true },
      { name: 'AccessFailedCount', type: 'INT', nullable: false },
      { name: 'CreatedAtUtc', type: 'DATETIMEOFFSET', nullable: false },
    ],
    indexes: [
      'PK_ApplicationUsers (UserId)',
      'UX_ApplicationUsers_NormalizedEmail (NormalizedEmail) UNIQUE',
      'IX_ApplicationUsers_CompanyId (CompanyId)',
    ],
    businessRules: [
      'Company-level isolation is enforced via CompanyId filtering on all queries.',
      'Account lockout triggered after 5 failed login attempts.',
    ],
  },
  {
    name: 'Accounts',
    category: 'Masters & Core',
    description: 'Chart of accounts defining financial ledger heads, categorised into Assets, Liabilities, Equity, Revenue, and Expenses.',
    columns: [
      { name: 'AccountId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Companies(CompanyId)' },
      { name: 'AccountCode', type: 'NVARCHAR(30)', nullable: false, notes: 'e.g. 1010, 2010, 4000' },
      { name: 'AccountName', type: 'NVARCHAR(150)', nullable: false, notes: 'e.g. Accounts Receivable, GST Payable' },
      { name: 'Category', type: 'INT', nullable: false, notes: '1=Asset, 2=Liability, 3=Equity, 4=Revenue, 5=Expense' },
      { name: 'NormalBalance', type: 'INT', nullable: false, notes: '1=Debit (Assets, Expenses), 2=Credit (Liabilities, Equity, Revenue)' },
      { name: 'ParentAccountId', type: 'UNIQUEIDENTIFIER', nullable: true, isFk: true, fkRef: 'Accounts(AccountId)', notes: 'Supports tree hierarchy' },
      { name: 'IsSystemAccount', type: 'BIT', nullable: false, notes: 'True if required by system engine (AR, AP, Retained Earnings, GST)' },
      { name: 'SystemAccountType', type: 'NVARCHAR(50)', nullable: true, notes: 'AccountsReceivable, AccountsPayable, GSTPayable, InputTaxCredit, Cash, Bank' },
      { name: 'IsActive', type: 'BIT', nullable: false, notes: 'Deactivated accounts cannot receive new journal postings' },
      { name: 'CreatedAtUtc', type: 'DATETIMEOFFSET', nullable: false },
    ],
    indexes: [
      'PK_Accounts (AccountId)',
      'UX_Accounts_CompanyId_AccountCode (CompanyId, AccountCode) UNIQUE',
      'IX_Accounts_CompanyId_Category (CompanyId, Category)',
    ],
    businessRules: [
      'Cannot delete an account that has posted journal lines attached.',
      'AccountCode must be unique per Company.',
      'System accounts cannot be deactivated or deleted.',
    ],
  },
  {
    name: 'Customers',
    category: 'Masters & Core',
    description: 'Customer directory holding commercial identities, GSTIN/PAN, billing address, and default credit terms.',
    columns: [
      { name: 'CustomerId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Companies(CompanyId)' },
      { name: 'CustomerName', type: 'NVARCHAR(200)', nullable: false },
      { name: 'ContactPerson', type: 'NVARCHAR(100)', nullable: true },
      { name: 'Email', type: 'NVARCHAR(150)', nullable: true },
      { name: 'Phone', type: 'NVARCHAR(30)', nullable: true },
      { name: 'BillingAddress', type: 'NVARCHAR(500)', nullable: true },
      { name: 'ShippingAddress', type: 'NVARCHAR(500)', nullable: true },
      { name: 'GSTIN', type: 'NVARCHAR(25)', nullable: true },
      { name: 'PAN', type: 'NVARCHAR(20)', nullable: true },
      { name: 'PaymentTermsDays', type: 'INT', nullable: false, notes: 'Default: 30 days' },
      { name: 'IsActive', type: 'BIT', nullable: false },
      { name: 'CreatedAtUtc', type: 'DATETIMEOFFSET', nullable: false },
    ],
    indexes: [
      'PK_Customers (CustomerId)',
      'IX_Customers_CompanyId_Name (CompanyId, CustomerName)',
      'IX_Customers_CompanyId_GSTIN (CompanyId, GSTIN)',
    ],
    businessRules: [
      'Customer balances are never stored as static editable numbers; calculated strictly from posted invoices and receipts.',
      'GSTIN format validated when entered.',
    ],
  },
  {
    name: 'Vendors',
    category: 'Masters & Core',
    description: 'Vendor directory storing supplier contact, tax identifiers, payment terms, and accounts payable relationship.',
    columns: [
      { name: 'VendorId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Companies(CompanyId)' },
      { name: 'VendorName', type: 'NVARCHAR(200)', nullable: false },
      { name: 'ContactPerson', type: 'NVARCHAR(100)', nullable: true },
      { name: 'Email', type: 'NVARCHAR(150)', nullable: true },
      { name: 'Phone', type: 'NVARCHAR(30)', nullable: true },
      { name: 'Address', type: 'NVARCHAR(500)', nullable: true },
      { name: 'GSTIN', type: 'NVARCHAR(25)', nullable: true },
      { name: 'PAN', type: 'NVARCHAR(20)', nullable: true },
      { name: 'PaymentTermsDays', type: 'INT', nullable: false, notes: 'Default: 15 days' },
      { name: 'IsActive', type: 'BIT', nullable: false },
      { name: 'CreatedAtUtc', type: 'DATETIMEOFFSET', nullable: false },
    ],
    indexes: [
      'PK_Vendors (VendorId)',
      'IX_Vendors_CompanyId_Name (CompanyId, VendorName)',
    ],
    businessRules: [
      'Vendor balance calculated dynamically from posted Purchase Bills minus recorded Vendor Payments.',
    ],
  },
  {
    name: 'SalesInvoices',
    category: 'Transactions',
    description: 'Commercial invoice header. Authoritative source of receivables upon posting.',
    columns: [
      { name: 'InvoiceId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Companies(CompanyId)' },
      { name: 'CustomerId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Customers(CustomerId)' },
      { name: 'InvoiceNumber', type: 'NVARCHAR(50)', nullable: false, notes: 'Unique per company e.g. INV-2026-0001' },
      { name: 'InvoiceDate', type: 'DATE', nullable: false },
      { name: 'DueDate', type: 'DATE', nullable: false },
      { name: 'PlaceOfSupply', type: 'NVARCHAR(100)', nullable: true, notes: 'Determines CGST+SGST vs IGST' },
      { name: 'Currency', type: 'CHAR(3)', nullable: false, notes: 'INR' },
      { name: 'SubTotal', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'TaxAmount', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'GrandTotal', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'PaidAmount', type: 'DECIMAL(18,2)', nullable: false, notes: 'Sum of reconciled allocations' },
      { name: 'BalanceAmount', type: 'DECIMAL(18,2)', nullable: false, notes: 'GrandTotal - PaidAmount' },
      { name: 'Status', type: 'NVARCHAR(30)', nullable: false, notes: 'Draft, Posted, PartiallyPaid, Paid, Voided' },
      { name: 'PostedJournalEntryId', type: 'UNIQUEIDENTIFIER', nullable: true, isFk: true, fkRef: 'JournalEntries(JournalEntryId)' },
      { name: 'CreatedBy', type: 'NVARCHAR(100)', nullable: false },
      { name: 'CreatedAtUtc', type: 'DATETIMEOFFSET', nullable: false },
      { name: 'PostedAtUtc', type: 'DATETIMEOFFSET', nullable: true },
    ],
    indexes: [
      'PK_SalesInvoices (InvoiceId)',
      'UX_SalesInvoices_CompanyId_InvoiceNumber (CompanyId, InvoiceNumber) UNIQUE',
      'IX_SalesInvoices_CompanyId_Status (CompanyId, Status)',
      'IX_SalesInvoices_CustomerId (CustomerId)',
    ],
    businessRules: [
      'Check constraint: GrandTotal = SubTotal + TaxAmount.',
      'Check constraint: BalanceAmount = GrandTotal - PaidAmount.',
      'Posting triggers atomic JournalEntry creation (DR Accounts Receivable, CR Revenue, CR Tax Payable).',
      'Posted invoices are immutable. Corrections require Credit Notes.',
    ],
  },
  {
    name: 'SalesInvoiceLines',
    category: 'Transactions',
    description: 'Itemized line items for sales invoices with specific revenue account mapping and GST rate.',
    columns: [
      { name: 'LineId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'InvoiceId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'SalesInvoices(InvoiceId)' },
      { name: 'RevenueAccountId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Accounts(AccountId)' },
      { name: 'Description', type: 'NVARCHAR(300)', nullable: false },
      { name: 'Quantity', type: 'DECIMAL(12,4)', nullable: false },
      { name: 'UnitPrice', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'DiscountAmount', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'TaxRatePercent', type: 'DECIMAL(5,2)', nullable: false, notes: 'e.g. 18.00%' },
      { name: 'SubTotal', type: 'DECIMAL(18,2)', nullable: false, notes: '(Quantity * UnitPrice) - DiscountAmount' },
      { name: 'TaxAmount', type: 'DECIMAL(18,2)', nullable: false, notes: 'SubTotal * (TaxRatePercent / 100)' },
      { name: 'LineTotal', type: 'DECIMAL(18,2)', nullable: false, notes: 'SubTotal + TaxAmount' },
    ],
    indexes: [
      'PK_SalesInvoiceLines (LineId)',
      'IX_SalesInvoiceLines_InvoiceId (InvoiceId)',
    ],
    businessRules: [
      'Check constraint: LineTotal = SubTotal + TaxAmount.',
      'Check constraint: Quantity > 0 AND UnitPrice >= 0.',
    ],
  },
  {
    name: 'PurchaseBills',
    category: 'Transactions',
    description: 'Vendor bills representing accounts payable obligations and eligible input tax credits.',
    columns: [
      { name: 'BillId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Companies(CompanyId)' },
      { name: 'VendorId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Vendors(VendorId)' },
      { name: 'BillNumber', type: 'NVARCHAR(50)', nullable: false, notes: 'Internal bill number' },
      { name: 'VendorInvoiceNumber', type: 'NVARCHAR(100)', nullable: false, notes: 'Suppliers invoice number' },
      { name: 'BillDate', type: 'DATE', nullable: false },
      { name: 'DueDate', type: 'DATE', nullable: false },
      { name: 'SubTotal', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'TaxAmount', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'GrandTotal', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'PaidAmount', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'BalanceAmount', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'Status', type: 'NVARCHAR(30)', nullable: false, notes: 'Draft, Posted, Paid, Cancelled' },
      { name: 'ExpenseAccountId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Accounts(AccountId)' },
      { name: 'PostedJournalEntryId', type: 'UNIQUEIDENTIFIER', nullable: true, isFk: true, fkRef: 'JournalEntries(JournalEntryId)' },
      { name: 'CreatedAtUtc', type: 'DATETIMEOFFSET', nullable: false },
    ],
    indexes: [
      'PK_PurchaseBills (BillId)',
      'UX_PurchaseBills_CompanyId_Vendor_InvoiceNum (CompanyId, VendorId, VendorInvoiceNumber) UNIQUE',
      'IX_PurchaseBills_CompanyId_Status (CompanyId, Status)',
    ],
    businessRules: [
      'Unique constraint prevents accidental double billing for same vendor invoice number.',
      'Posting generates: DR Expense / Asset, DR Input Tax Credit, CR Accounts Payable.',
    ],
  },
  {
    name: 'Expenses',
    category: 'Transactions',
    description: 'Direct operational expenses paid via cash/bank or submitted by employees for reimbursement.',
    columns: [
      { name: 'ExpenseId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Companies(CompanyId)' },
      { name: 'ExpenseAccountId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Accounts(AccountId)' },
      { name: 'PaymentAccountId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Accounts(AccountId)', notes: 'Bank or Cash Account' },
      { name: 'VendorId', type: 'UNIQUEIDENTIFIER', nullable: true, isFk: true, fkRef: 'Vendors(VendorId)' },
      { name: 'ExpenseDate', type: 'DATE', nullable: false },
      { name: 'Amount', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'TaxAmount', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'TotalAmount', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'PaymentMethod', type: 'NVARCHAR(50)', nullable: false, notes: 'BankTransfer, CorporateCard, Cash' },
      { name: 'Status', type: 'NVARCHAR(30)', nullable: false, notes: 'Draft, Submitted, Approved, Posted, Rejected' },
      { name: 'PostedJournalEntryId', type: 'UNIQUEIDENTIFIER', nullable: true, isFk: true, fkRef: 'JournalEntries(JournalEntryId)' },
      { name: 'ApprovedBy', type: 'NVARCHAR(100)', nullable: true },
      { name: 'CreatedAtUtc', type: 'DATETIMEOFFSET', nullable: false },
    ],
    indexes: [
      'PK_Expenses (ExpenseId)',
      'IX_Expenses_CompanyId_Date (CompanyId, ExpenseDate)',
      'IX_Expenses_CompanyId_Status (CompanyId, Status)',
    ],
    businessRules: [
      'Posting generates: DR Expense Account, DR Input Tax Credit (if tax > 0), CR Bank/Cash Account.',
      'Expenses above company threshold require Finance Manager approval.',
    ],
  },
  {
    name: 'JournalEntries',
    category: 'Double-Entry Ledger',
    description: 'The immutable double-entry transaction header. Every posting in the system writes here.',
    columns: [
      { name: 'JournalEntryId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Companies(CompanyId)' },
      { name: 'JournalNumber', type: 'NVARCHAR(50)', nullable: false, notes: 'e.g. JRN-2026-00012' },
      { name: 'TransactionDate', type: 'DATE', nullable: false },
      { name: 'Description', type: 'NVARCHAR(500)', nullable: false },
      { name: 'SourceType', type: 'NVARCHAR(50)', nullable: false, notes: 'SalesInvoice, PurchaseBill, Expense, CustomerReceipt, VendorPayment, BankTransfer, ManualJournal, PeriodClosing' },
      { name: 'SourceId', type: 'UNIQUEIDENTIFIER', nullable: true, notes: 'Links to originating invoice, bill, or payment ID' },
      { name: 'Status', type: 'NVARCHAR(20)', nullable: false, notes: 'Posted, Reversed' },
      { name: 'TotalDebit', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'TotalCredit', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'IsReversed', type: 'BIT', nullable: false, notes: 'Default 0' },
      { name: 'ReversedByJournalId', type: 'UNIQUEIDENTIFIER', nullable: true, isFk: true, fkRef: 'JournalEntries(JournalEntryId)' },
      { name: 'PostedBy', type: 'NVARCHAR(100)', nullable: false },
      { name: 'PostedAtUtc', type: 'DATETIMEOFFSET', nullable: false },
    ],
    indexes: [
      'PK_JournalEntries (JournalEntryId)',
      'UX_JournalEntries_CompanyId_JournalNum (CompanyId, JournalNumber) UNIQUE',
      'IX_JournalEntries_CompanyId_Date (CompanyId, TransactionDate)',
      'IX_JournalEntries_Source (SourceType, SourceId)',
    ],
    businessRules: [
      'MANDATORY CONSTRAINT: TotalDebit MUST EQUAL TotalCredit.',
      'Once Status=Posted, record cannot be modified or deleted.',
      'Corrections can ONLY be achieved by creating an offsetting reversal journal entry.',
    ],
  },
  {
    name: 'JournalEntryLines',
    category: 'Double-Entry Ledger',
    description: 'Individual debits and credits that comprise a balanced journal entry.',
    columns: [
      { name: 'JournalEntryLineId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'JournalEntryId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'JournalEntries(JournalEntryId)' },
      { name: 'AccountId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Accounts(AccountId)' },
      { name: 'DebitAmount', type: 'DECIMAL(18,2)', nullable: false, notes: 'Must be >= 0' },
      { name: 'CreditAmount', type: 'DECIMAL(18,2)', nullable: false, notes: 'Must be >= 0' },
      { name: 'Description', type: 'NVARCHAR(300)', nullable: true },
    ],
    indexes: [
      'PK_JournalEntryLines (JournalEntryLineId)',
      'IX_JournalEntryLines_JournalEntryId (JournalEntryId)',
      'IX_JournalEntryLines_AccountId (AccountId)',
    ],
    businessRules: [
      'CHECK (DebitAmount >= 0 AND CreditAmount >= 0)',
      'CHECK (NOT (DebitAmount > 0 AND CreditAmount > 0)) - line cannot contain both debit and credit.',
      'CHECK (DebitAmount > 0 OR CreditAmount > 0) - line cannot be zero on both sides.',
    ],
  },
  {
    name: 'Payments',
    category: 'Double-Entry Ledger',
    description: 'Monetary settlement records for customer receipts, vendor payments, or miscellaneous transfers.',
    columns: [
      { name: 'PaymentId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Companies(CompanyId)' },
      { name: 'PaymentNumber', type: 'NVARCHAR(50)', nullable: false, notes: 'e.g. REC-2026-001 or PAY-2026-001' },
      { name: 'PartyType', type: 'NVARCHAR(20)', nullable: false, notes: 'Customer, Vendor, Other' },
      { name: 'CustomerId', type: 'UNIQUEIDENTIFIER', nullable: true, isFk: true, fkRef: 'Customers(CustomerId)' },
      { name: 'VendorId', type: 'UNIQUEIDENTIFIER', nullable: true, isFk: true, fkRef: 'Vendors(VendorId)' },
      { name: 'BankAccountId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'BankAccounts(BankAccountId)' },
      { name: 'PaymentDate', type: 'DATE', nullable: false },
      { name: 'PaymentType', type: 'NVARCHAR(20)', nullable: false, notes: 'Receipt (Inflow) or Payment (Outflow)' },
      { name: 'PaymentMethod', type: 'NVARCHAR(30)', nullable: false, notes: 'NEFT, RTGS, UPI, Cheque, Wire' },
      { name: 'Amount', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'ReferenceNumber', type: 'NVARCHAR(100)', nullable: true, notes: 'Bank UTR or Cheque Number' },
      { name: 'Status', type: 'NVARCHAR(20)', nullable: false, notes: 'Posted, Reconciled, Reversed' },
      { name: 'PostedJournalEntryId', type: 'UNIQUEIDENTIFIER', nullable: true, isFk: true, fkRef: 'JournalEntries(JournalEntryId)' },
      { name: 'CreatedAtUtc', type: 'DATETIMEOFFSET', nullable: false },
    ],
    indexes: [
      'PK_Payments (PaymentId)',
      'UX_Payments_CompanyId_PaymentNumber (CompanyId, PaymentNumber) UNIQUE',
      'IX_Payments_CompanyId_Date (CompanyId, PaymentDate)',
    ],
    businessRules: [
      'If PartyType=Customer, CustomerId is required and PaymentType is Receipt.',
      'If PartyType=Vendor, VendorId is required and PaymentType is Payment.',
      'Posting Customer Receipt generates: DR Bank, CR Accounts Receivable.',
      'Posting Vendor Payment generates: DR Accounts Payable, CR Bank.',
    ],
  },
  {
    name: 'PaymentAllocations',
    category: 'Double-Entry Ledger',
    description: 'Maps payment funds to specific Sales Invoices or Purchase Bills, decrementing their outstanding balances.',
    columns: [
      { name: 'AllocationId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'PaymentId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Payments(PaymentId)' },
      { name: 'DocumentType', type: 'NVARCHAR(30)', nullable: false, notes: 'SalesInvoice or PurchaseBill' },
      { name: 'DocumentId', type: 'UNIQUEIDENTIFIER', nullable: false, notes: 'Id of invoice or bill' },
      { name: 'AllocatedAmount', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'CreatedAtUtc', type: 'DATETIMEOFFSET', nullable: false },
    ],
    indexes: [
      'PK_PaymentAllocations (AllocationId)',
      'IX_PaymentAllocations_PaymentId (PaymentId)',
      'IX_PaymentAllocations_Document (DocumentType, DocumentId)',
    ],
    businessRules: [
      'Sum of AllocatedAmount across payment cannot exceed Payment.Amount.',
      'AllocatedAmount cannot exceed Document.BalanceAmount.',
    ],
  },
  {
    name: 'BankAccounts',
    category: 'Banking & Audit',
    description: 'Bank and liquid accounts linked to general ledger Cash/Bank accounts.',
    columns: [
      { name: 'BankAccountId', type: 'UNIQUEIDENTIFIER', nullable: false, isPk: true },
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Companies(CompanyId)' },
      { name: 'BankName', type: 'NVARCHAR(150)', nullable: false },
      { name: 'AccountNumber', type: 'NVARCHAR(50)', nullable: false },
      { name: 'IFSCCode', type: 'NVARCHAR(20)', nullable: true },
      { name: 'BranchName', type: 'NVARCHAR(100)', nullable: true },
      { name: 'LinkedAccountId', type: 'UNIQUEIDENTIFIER', nullable: false, isFk: true, fkRef: 'Accounts(AccountId)', notes: 'Ledger account (Asset: Bank)' },
      { name: 'OpeningBalance', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'CurrentBalance', type: 'DECIMAL(18,2)', nullable: false },
      { name: 'IsActive', type: 'BIT', nullable: false },
    ],
    indexes: [
      'PK_BankAccounts (BankAccountId)',
      'UX_BankAccounts_Company_AccNum (CompanyId, AccountNumber) UNIQUE',
    ],
    businessRules: [
      'Bank transfers between two company bank accounts debit Destination Bank and credit Source Bank (never revenue/expense).',
    ],
  },
  {
    name: 'AuditLogs',
    category: 'Banking & Audit',
    description: 'Immutable security and financial audit trail capturing who performed what action, when, and changes made.',
    columns: [
      { name: 'AuditLogId', type: 'BIGINT', nullable: false, isPk: true, notes: 'IDENTITY(1,1)' },
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false },
      { name: 'UserId', type: 'UNIQUEIDENTIFIER', nullable: false },
      { name: 'ActionType', type: 'NVARCHAR(50)', nullable: false, notes: 'PostInvoice, ReversePayment, ClosePeriod, EditRole' },
      { name: 'EntityType', type: 'NVARCHAR(100)', nullable: false, notes: 'SalesInvoice, JournalEntry, User' },
      { name: 'EntityId', type: 'NVARCHAR(100)', nullable: false },
      { name: 'TimestampUtc', type: 'DATETIMEOFFSET', nullable: false },
      { name: 'IpAddress', type: 'NVARCHAR(45)', nullable: true },
      { name: 'CorrelationId', type: 'NVARCHAR(50)', nullable: true },
      { name: 'DetailsJson', type: 'NVARCHAR(MAX)', nullable: true, notes: 'Sanitized delta (no passwords/tokens)' },
    ],
    indexes: [
      'PK_AuditLogs (AuditLogId)',
      'IX_AuditLogs_CompanyId_Timestamp (CompanyId, TimestampUtc DESC)',
      'IX_AuditLogs_Entity (EntityType, EntityId)',
    ],
    businessRules: [
      'Append-only table; UPDATE and DELETE triggers raise errors.',
      'Never records plain passwords, tokens, or card numbers.',
    ],
  },
];

export const SQL_SERVER_DDL_SCRIPT = `
-- =========================================================================
-- STARTUP ACCOUNTING MANAGEMENT SYSTEM
-- Microsoft SQL Server Complete DDL Schema (Production-Grade)
-- Database Engine: Microsoft SQL Server 2019 / 2022 / Azure SQL Database
-- Features: Strict Decimal Precision, Foreign Keys, Audit Logs, Check Constraints
-- =========================================================================

-- 1. Companies (Tenant Root)
CREATE TABLE dbo.Companies (
    CompanyId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    LegalName NVARCHAR(200) NOT NULL,
    TradeName NVARCHAR(200) NULL,
    PAN NVARCHAR(20) NULL,
    GSTIN NVARCHAR(25) NULL,
    CurrencyCode CHAR(3) NOT NULL DEFAULT 'INR',
    CurrencySymbol NVARCHAR(5) NOT NULL DEFAULT N'₹',
    FiscalYearStartMonth INT NOT NULL DEFAULT 4, -- April
    InvoicePrefix NVARCHAR(10) NOT NULL DEFAULT 'INV-',
    NextInvoiceNumber INT NOT NULL DEFAULT 1001,
    BillPrefix NVARCHAR(10) NOT NULL DEFAULT 'BILL-',
    NextBillNumber INT NOT NULL DEFAULT 1001,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAtUtc DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAtUtc DATETIMEOFFSET NULL,
    RowVersion ROWVERSION NOT NULL,
    CONSTRAINT PK_Companies PRIMARY KEY CLUSTERED (CompanyId)
);
GO

CREATE UNIQUE NONCLUSTERED INDEX UX_Companies_GSTIN 
ON dbo.Companies (GSTIN) 
WHERE GSTIN IS NOT NULL;
GO

-- 2. Application Users
CREATE TABLE dbo.ApplicationUsers (
    UserId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NULL,
    Email NVARCHAR(256) NOT NULL,
    NormalizedEmail NVARCHAR(256) NOT NULL,
    FullName NVARCHAR(150) NOT NULL,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Role NVARCHAR(50) NOT NULL, -- SuperAdmin, CompanyAdmin, Accountant, FinanceManager, Employee, Auditor
    IsActive BIT NOT NULL DEFAULT 1,
    LockoutEnd DATETIMEOFFSET NULL,
    AccessFailedCount INT NOT NULL DEFAULT 0,
    CreatedAtUtc DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_ApplicationUsers PRIMARY KEY CLUSTERED (UserId),
    CONSTRAINT FK_ApplicationUsers_Company FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId)
);
GO

CREATE UNIQUE NONCLUSTERED INDEX UX_ApplicationUsers_NormalizedEmail 
ON dbo.ApplicationUsers (NormalizedEmail);
GO

-- 3. Chart of Accounts
CREATE TABLE dbo.Accounts (
    AccountId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    AccountCode NVARCHAR(30) NOT NULL,
    AccountName NVARCHAR(150) NOT NULL,
    Category INT NOT NULL, -- 1=Asset, 2=Liability, 3=Equity, 4=Revenue, 5=Expense
    NormalBalance INT NOT NULL, -- 1=Debit, 2=Credit
    ParentAccountId UNIQUEIDENTIFIER NULL,
    IsSystemAccount BIT NOT NULL DEFAULT 0,
    SystemAccountType NVARCHAR(50) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAtUtc DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_Accounts PRIMARY KEY CLUSTERED (AccountId),
    CONSTRAINT FK_Accounts_Company FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
    CONSTRAINT FK_Accounts_Parent FOREIGN KEY (ParentAccountId) REFERENCES dbo.Accounts(AccountId)
);
GO

CREATE UNIQUE NONCLUSTERED INDEX UX_Accounts_Company_Code 
ON dbo.Accounts (CompanyId, AccountCode);
GO

-- 4. Bank Accounts
CREATE TABLE dbo.BankAccounts (
    BankAccountId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    BankName NVARCHAR(150) NOT NULL,
    AccountNumber NVARCHAR(50) NOT NULL,
    IFSCCode NVARCHAR(20) NULL,
    BranchName NVARCHAR(100) NULL,
    LinkedAccountId UNIQUEIDENTIFIER NOT NULL,
    OpeningBalance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    CurrentBalance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_BankAccounts PRIMARY KEY CLUSTERED (BankAccountId),
    CONSTRAINT FK_BankAccounts_Company FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
    CONSTRAINT FK_BankAccounts_Account FOREIGN KEY (LinkedAccountId) REFERENCES dbo.Accounts(AccountId)
);
GO

-- 5. Customers
CREATE TABLE dbo.Customers (
    CustomerId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    CustomerName NVARCHAR(200) NOT NULL,
    ContactPerson NVARCHAR(100) NULL,
    Email NVARCHAR(150) NULL,
    Phone NVARCHAR(30) NULL,
    BillingAddress NVARCHAR(500) NULL,
    ShippingAddress NVARCHAR(500) NULL,
    GSTIN NVARCHAR(25) NULL,
    PAN NVARCHAR(20) NULL,
    PaymentTermsDays INT NOT NULL DEFAULT 30,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAtUtc DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_Customers PRIMARY KEY CLUSTERED (CustomerId),
    CONSTRAINT FK_Customers_Company FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId)
);
GO

-- 6. Vendors
CREATE TABLE dbo.Vendors (
    VendorId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    VendorName NVARCHAR(200) NOT NULL,
    ContactPerson NVARCHAR(100) NULL,
    Email NVARCHAR(150) NULL,
    Phone NVARCHAR(30) NULL,
    Address NVARCHAR(500) NULL,
    GSTIN NVARCHAR(25) NULL,
    PAN NVARCHAR(20) NULL,
    PaymentTermsDays INT NOT NULL DEFAULT 15,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAtUtc DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_Vendors PRIMARY KEY CLUSTERED (VendorId),
    CONSTRAINT FK_Vendors_Company FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId)
);
GO

-- 7. Journal Entries (Double-Entry Header)
CREATE TABLE dbo.JournalEntries (
    JournalEntryId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    JournalNumber NVARCHAR(50) NOT NULL,
    TransactionDate DATE NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    SourceType NVARCHAR(50) NOT NULL, -- SalesInvoice, PurchaseBill, Expense, CustomerReceipt, VendorPayment, BankTransfer, ManualJournal
    SourceId UNIQUEIDENTIFIER NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Posted', -- Posted, Reversed
    TotalDebit DECIMAL(18,2) NOT NULL,
    TotalCredit DECIMAL(18,2) NOT NULL,
    IsReversed BIT NOT NULL DEFAULT 0,
    ReversedByJournalId UNIQUEIDENTIFIER NULL,
    PostedBy NVARCHAR(100) NOT NULL,
    PostedAtUtc DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_JournalEntries PRIMARY KEY CLUSTERED (JournalEntryId),
    CONSTRAINT FK_JournalEntries_Company FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
    CONSTRAINT FK_JournalEntries_Reversal FOREIGN KEY (ReversedByJournalId) REFERENCES dbo.JournalEntries(JournalEntryId),
    CONSTRAINT CK_JournalEntries_Balanced CHECK (TotalDebit = TotalCredit AND TotalDebit > 0)
);
GO

CREATE UNIQUE NONCLUSTERED INDEX UX_JournalEntries_Company_Number 
ON dbo.JournalEntries (CompanyId, JournalNumber);
GO

-- 8. Journal Entry Lines (Debit & Credit details)
CREATE TABLE dbo.JournalEntryLines (
    JournalEntryLineId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    JournalEntryId UNIQUEIDENTIFIER NOT NULL,
    AccountId UNIQUEIDENTIFIER NOT NULL,
    DebitAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    CreditAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    Description NVARCHAR(300) NULL,
    CONSTRAINT PK_JournalEntryLines PRIMARY KEY CLUSTERED (JournalEntryLineId),
    CONSTRAINT FK_JournalEntryLines_Header FOREIGN KEY (JournalEntryId) REFERENCES dbo.JournalEntries(JournalEntryId) ON DELETE CASCADE,
    CONSTRAINT FK_JournalEntryLines_Account FOREIGN KEY (AccountId) REFERENCES dbo.Accounts(AccountId),
    CONSTRAINT CK_JournalEntryLines_NonNegative CHECK (DebitAmount >= 0 AND CreditAmount >= 0),
    CONSTRAINT CK_JournalEntryLines_OneSided CHECK (NOT (DebitAmount > 0 AND CreditAmount > 0)),
    CONSTRAINT CK_JournalEntryLines_NonZero CHECK (DebitAmount > 0 OR CreditAmount > 0)
);
GO

-- 9. Sales Invoices
CREATE TABLE dbo.SalesInvoices (
    InvoiceId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    InvoiceNumber NVARCHAR(50) NOT NULL,
    InvoiceDate DATE NOT NULL,
    DueDate DATE NOT NULL,
    PlaceOfSupply NVARCHAR(100) NULL,
    Currency CHAR(3) NOT NULL DEFAULT 'INR',
    SubTotal DECIMAL(18,2) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL,
    GrandTotal DECIMAL(18,2) NOT NULL,
    PaidAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    BalanceAmount DECIMAL(18,2) NOT NULL,
    Status NVARCHAR(30) NOT NULL DEFAULT 'Draft', -- Draft, Posted, PartiallyPaid, Paid, Voided
    PostedJournalEntryId UNIQUEIDENTIFIER NULL,
    CreatedBy NVARCHAR(100) NOT NULL,
    CreatedAtUtc DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    PostedAtUtc DATETIMEOFFSET NULL,
    CONSTRAINT PK_SalesInvoices PRIMARY KEY CLUSTERED (InvoiceId),
    CONSTRAINT FK_SalesInvoices_Company FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
    CONSTRAINT FK_SalesInvoices_Customer FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(CustomerId),
    CONSTRAINT FK_SalesInvoices_Journal FOREIGN KEY (PostedJournalEntryId) REFERENCES dbo.JournalEntries(JournalEntryId),
    CONSTRAINT CK_SalesInvoices_Total CHECK (GrandTotal = SubTotal + TaxAmount),
    CONSTRAINT CK_SalesInvoices_Balance CHECK (BalanceAmount = GrandTotal - PaidAmount)
);
GO

CREATE UNIQUE NONCLUSTERED INDEX UX_SalesInvoices_Company_Number 
ON dbo.SalesInvoices (CompanyId, InvoiceNumber);
GO

-- 10. Sales Invoice Lines
CREATE TABLE dbo.SalesInvoiceLines (
    LineId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    InvoiceId UNIQUEIDENTIFIER NOT NULL,
    RevenueAccountId UNIQUEIDENTIFIER NOT NULL,
    Description NVARCHAR(300) NOT NULL,
    Quantity DECIMAL(12,4) NOT NULL DEFAULT 1.0000,
    UnitPrice DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    TaxRatePercent DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    SubTotal DECIMAL(18,2) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL,
    LineTotal DECIMAL(18,2) NOT NULL,
    CONSTRAINT PK_SalesInvoiceLines PRIMARY KEY CLUSTERED (LineId),
    CONSTRAINT FK_SalesInvoiceLines_Header FOREIGN KEY (InvoiceId) REFERENCES dbo.SalesInvoices(InvoiceId) ON DELETE CASCADE,
    CONSTRAINT FK_SalesInvoiceLines_Account FOREIGN KEY (RevenueAccountId) REFERENCES dbo.Accounts(AccountId),
    CONSTRAINT CK_SalesInvoiceLines_Math CHECK (LineTotal = SubTotal + TaxAmount)
);
GO

-- 11. Payments & Receipts
CREATE TABLE dbo.Payments (
    PaymentId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    PaymentNumber NVARCHAR(50) NOT NULL,
    PartyType NVARCHAR(20) NOT NULL, -- Customer, Vendor, Other
    CustomerId UNIQUEIDENTIFIER NULL,
    VendorId UNIQUEIDENTIFIER NULL,
    BankAccountId UNIQUEIDENTIFIER NOT NULL,
    PaymentDate DATE NOT NULL,
    PaymentType NVARCHAR(20) NOT NULL, -- Receipt, Payment
    PaymentMethod NVARCHAR(30) NOT NULL, -- NEFT, RTGS, UPI, Cheque, Wire
    Amount DECIMAL(18,2) NOT NULL,
    ReferenceNumber NVARCHAR(100) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Posted',
    PostedJournalEntryId UNIQUEIDENTIFIER NULL,
    CreatedAtUtc DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_Payments PRIMARY KEY CLUSTERED (PaymentId),
    CONSTRAINT FK_Payments_Company FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
    CONSTRAINT FK_Payments_Customer FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(CustomerId),
    CONSTRAINT FK_Payments_Vendor FOREIGN KEY (VendorId) REFERENCES dbo.Vendors(VendorId),
    CONSTRAINT FK_Payments_BankAccount FOREIGN KEY (BankAccountId) REFERENCES dbo.BankAccounts(BankAccountId),
    CONSTRAINT FK_Payments_Journal FOREIGN KEY (PostedJournalEntryId) REFERENCES dbo.JournalEntries(JournalEntryId),
    CONSTRAINT CK_Payments_Amount CHECK (Amount > 0)
);
GO

-- 12. Payment Allocations
CREATE TABLE dbo.PaymentAllocations (
    AllocationId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    PaymentId UNIQUEIDENTIFIER NOT NULL,
    DocumentType NVARCHAR(30) NOT NULL, -- SalesInvoice, PurchaseBill
    DocumentId UNIQUEIDENTIFIER NOT NULL,
    AllocatedAmount DECIMAL(18,2) NOT NULL,
    CreatedAtUtc DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_PaymentAllocations PRIMARY KEY CLUSTERED (AllocationId),
    CONSTRAINT FK_PaymentAllocations_Payment FOREIGN KEY (PaymentId) REFERENCES dbo.Payments(PaymentId) ON DELETE CASCADE,
    CONSTRAINT CK_PaymentAllocations_Positive CHECK (AllocatedAmount > 0)
);
GO

-- 13. Audit Logs
CREATE TABLE dbo.AuditLogs (
    AuditLogId BIGINT IDENTITY(1,1) NOT NULL,
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    ActionType NVARCHAR(50) NOT NULL,
    EntityType NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(100) NOT NULL,
    TimestampUtc DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    IpAddress NVARCHAR(45) NULL,
    CorrelationId NVARCHAR(50) NULL,
    DetailsJson NVARCHAR(MAX) NULL,
    CONSTRAINT PK_AuditLogs PRIMARY KEY CLUSTERED (AuditLogId)
);
GO

CREATE NONCLUSTERED INDEX IX_AuditLogs_Company_Time 
ON dbo.AuditLogs (CompanyId, TimestampUtc DESC);
GO
`;
