export type UserRole = 
  | 'Super Admin' 
  | 'Company Admin' 
  | 'Accountant' 
  | 'Finance Manager' 
  | 'Employee' 
  | 'Auditor';

export type AccountCategory = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
export type NormalBalance = 'Debit' | 'Credit';

export interface Company {
  id: string;
  legalName: string;
  tradeName: string;
  pan: string;
  gstin: string;
  currencyCode: string;
  currencySymbol: string;
  fiscalYearStartMonth: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  billPrefix: string;
  nextBillNumber: number;
  address: string;
  email: string;
  phone: string;
  isActive: boolean;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  category: AccountCategory;
  normalBalance: NormalBalance;
  parentAccountId?: string;
  isSystemAccount: boolean;
  systemAccountType?: string;
  isActive: boolean;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  gstin: string;
  pan: string;
  paymentTermsDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  pan: string;
  paymentTermsDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  revenueAccountId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxRatePercent: number; // 0, 5, 12, 18, 28
  subtotal: number;
  taxAmount: number;
  total: number;
}

export type InvoiceStatus = 'Draft' | 'Posted' | 'PartiallyPaid' | 'Paid' | 'Voided';

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;
  currency: string;
  lines: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
  notes?: string;
  postedJournalEntryId?: string;
  createdAt: string;
  createdBy: string;
}

export interface PurchaseBillLine {
  id: string;
  expenseAccountId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface PurchaseBill {
  id: string;
  billNumber: string;
  vendorId: string;
  vendorInvoiceNumber: string;
  billDate: string;
  dueDate: string;
  lines: PurchaseBillLine[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'Draft' | 'Posted' | 'Paid' | 'Voided';
  postedJournalEntryId?: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  expenseAccountId: string;
  paymentAccountId: string;
  vendorId?: string;
  expenseDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  description: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Posted' | 'Rejected';
  postedJournalEntryId?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface JournalLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

export interface JournalEntry {
  id: string;
  journalNumber: string;
  transactionDate: string;
  description: string;
  sourceType: 'SalesInvoice' | 'PurchaseBill' | 'Expense' | 'CustomerReceipt' | 'VendorPayment' | 'BankTransfer' | 'ManualJournal' | 'PeriodClosing';
  sourceId?: string;
  status: 'Draft' | 'Posted' | 'Reversed';
  totalDebit: number;
  totalCredit: number;
  isReversed: boolean;
  reversedByJournalId?: string;
  postedBy: string;
  postedAt: string;
  lines: JournalLine[];
}

export interface PaymentAllocation {
  id: string;
  documentType: 'SalesInvoice' | 'PurchaseBill';
  documentId: string;
  allocatedAmount: number;
}

export interface PaymentRecord {
  id: string;
  paymentNumber: string;
  partyType: 'Customer' | 'Vendor';
  partyId: string;
  bankAccountId: string;
  paymentDate: string;
  paymentType: 'Receipt' | 'Payment';
  paymentMethod: 'NEFT' | 'RTGS' | 'UPI' | 'Cheque' | 'Wire' | 'Cash';
  amount: number;
  referenceNumber: string;
  status: 'Posted' | 'Reversed';
  allocations: PaymentAllocation[];
  postedJournalEntryId?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  linkedAccountId: string; // AccountId in COA
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  details?: Record<string, any>;
}

export type ActiveNavSection = 
  | 'dashboard'
  | 'company-profile'
  | 'chart-of-accounts'
  | 'customers'
  | 'vendors'
  | 'sales-invoices'
  | 'customer-receipts'
  | 'purchase-bills'
  | 'vendor-payments'
  | 'expenses'
  | 'journal-entries'
  | 'general-ledger'
  | 'trial-balance'
  | 'profit-loss'
  | 'balance-sheet'
  | 'ar-aging'
  | 'bank-accounts'
  | 'bank-reconciliation'
  | 'audit-logs'
  | 'backend-architecture';
