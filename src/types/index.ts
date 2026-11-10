export type NavigationTab = 
  | 'architecture' 
  | 'requirements' 
  | 'database-schema' 
  | 'erd-diagram'
  | 'ef-core' 
  | 'fk-constraints'
  | 'simulator' 
  | 'cli-migrations' 
  | 'checklist';

export type UserRole = 
  | 'Super Admin' 
  | 'Company Admin' 
  | 'Accountant' 
  | 'Finance Manager' 
  | 'Employee' 
  | 'Auditor';

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  isPk?: boolean;
  isFk?: boolean;
  fkRef?: string;
  notes?: string;
  constraint?: string;
}

export interface TableDefinition {
  name: string;
  category: 'Security & Tenant' | 'Masters & Core' | 'Transactions' | 'Double-Entry Ledger' | 'Banking & Audit';
  description: string;
  columns: ColumnDefinition[];
  indexes: string[];
  businessRules: string[];
}

export interface EntityRelationship {
  id: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  cardinality: '1:1' | '1:N' | 'N:M';
  onDelete: 'Restrict' | 'Cascade' | 'SetNull';
  description: string;
}

export interface JournalLineSim {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  debit: number;
  credit: number;
  description: string;
}

export interface JournalEntrySim {
  id: string;
  journalNumber: string;
  date: string;
  sourceType: 'SalesInvoice' | 'PurchaseBill' | 'Expense' | 'CustomerReceipt' | 'VendorPayment' | 'BankTransfer' | 'ManualJournal';
  sourceReference: string;
  description: string;
  lines: JournalLineSim[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  postedAt: string;
  postedBy: string;
}
