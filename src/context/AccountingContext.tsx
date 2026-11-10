import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  Company, 
  Account, 
  Customer, 
  Vendor, 
  BankAccount, 
  SalesInvoice, 
  PurchaseBill, 
  ExpenseRecord, 
  JournalEntry, 
  PaymentRecord, 
  AuditLogItem,
  UserRole,
  ActiveNavSection,
  InvoiceLineItem
} from '../types/accounting';
import { 
  INITIAL_COMPANY, 
  INITIAL_ACCOUNTS, 
  INITIAL_BANK_ACCOUNTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_VENDORS, 
  INITIAL_INVOICES, 
  INITIAL_BILLS, 
  INITIAL_EXPENSES, 
  INITIAL_JOURNAL_ENTRIES, 
  INITIAL_PAYMENTS, 
  INITIAL_AUDIT_LOGS 
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description: string;
}

export interface GeneralLedgerRow {
  date: string;
  journalNumber: string;
  sourceType: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface TrialBalanceItem {
  accountId: string;
  code: string;
  name: string;
  category: string;
  normalBalance: string;
  debitBalance: number;
  creditBalance: number;
}

interface AccountingContextType {
  company: Company;
  updateCompany: (updated: Partial<Company>) => void;
  accounts: Account[];
  addAccount: (acc: Omit<Account, 'id' | 'isSystemAccount'>) => boolean;
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt'>) => void;
  vendors: Vendor[];
  addVendor: (vend: Omit<Vendor, 'id' | 'createdAt'>) => void;
  bankAccounts: BankAccount[];
  invoices: SalesInvoice[];
  bills: PurchaseBill[];
  expenses: ExpenseRecord[];
  journalEntries: JournalEntry[];
  payments: PaymentRecord[];
  auditLogs: AuditLogItem[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeSection: ActiveNavSection;
  setActiveSection: (section: ActiveNavSection) => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, description: string) => void;

  // Actions
  createSalesInvoice: (invoice: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'status' | 'paidAmount' | 'balanceAmount' | 'createdAt' | 'createdBy'>) => string;
  postSalesInvoice: (invoiceId: string) => boolean;
  recordCustomerReceipt: (invoiceId: string, bankAccountId: string, amount: number, paymentMethod: any, referenceNumber: string) => boolean;
  createPurchaseBill: (bill: Omit<PurchaseBill, 'id' | 'billNumber' | 'paidAmount' | 'balanceAmount' | 'status' | 'createdAt'>) => string;
  postPurchaseBill: (billId: string) => boolean;
  recordVendorPayment: (billId: string, bankAccountId: string, amount: number, paymentMethod: any, referenceNumber: string) => boolean;
  createExpense: (expense: Omit<ExpenseRecord, 'id' | 'status' | 'createdAt'>) => boolean;
  postManualJournal: (description: string, lines: { accountId: string; debit: number; credit: number; description: string }[]) => boolean;
  reverseJournalEntry: (journalId: string) => boolean;
  transferBetweenBanks: (fromBankId: string, toBankId: string, amount: number, refNumber: string) => boolean;

  // Real-time Calculators
  getGeneralLedger: (accountId: string) => GeneralLedgerRow[];
  getTrialBalance: () => { items: TrialBalanceItem[]; totalDebit: number; totalCredit: number; isBalanced: boolean };
  getProfitAndLoss: () => { revenueTotal: number; expensesTotal: number; netProfit: number; revenueItems: { name: string; amount: number }[]; expenseItems: { name: string; amount: number }[] };
  getBalanceSheet: () => { totalAssets: number; totalLiabilities: number; totalEquity: number; netIncome: number; isBalanced: boolean; assetItems: { name: string; amount: number }[]; liabilityItems: { name: string; amount: number }[]; equityItems: { name: string; amount: number }[] };
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<Company>(INITIAL_COMPANY);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [invoices, setInvoices] = useState<SalesInvoice[]>(INITIAL_INVOICES);
  const [bills, setBills] = useState<PurchaseBill[]>(INITIAL_BILLS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [currentRole, setCurrentRole] = useState<UserRole>('Company Admin');
  const [activeSection, setActiveSection] = useState<ActiveNavSection>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, description: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => dismissToast(id), 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addAuditLog = (action: string, entityType: string, entityId: string, description: string, details?: any) => {
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: `${currentRole.toLowerCase().replace(' ', '_')}@acmetech.io`,
      action,
      entityType,
      entityId,
      description,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updateCompany = (updated: Partial<Company>) => {
    setCompany((prev) => ({ ...prev, ...updated }));
    addAuditLog('UPDATE_COMPANY_CONFIG', 'Company', company.id, 'Updated company profile settings.');
    showToast('success', 'Company Profile Updated', 'Changes have been saved successfully.');
  };

  const addAccount = (acc: Omit<Account, 'id' | 'isSystemAccount'>) => {
    if (accounts.some((a) => a.code === acc.code)) {
      showToast('error', 'Duplicate Account Code', `Account with code ${acc.code} already exists.`);
      return false;
    }
    const newAcc: Account = {
      ...acc,
      id: `acc-${Date.now()}`,
      isSystemAccount: false,
    };
    setAccounts((prev) => [...prev, newAcc]);
    addAuditLog('CREATE_ACCOUNT', 'Account', newAcc.id, `Created chart of account: ${newAcc.code} - ${newAcc.name}`);
    showToast('success', 'Account Created', `Account ${newAcc.code} added to Chart of Accounts.`);
    return true;
  };

  const addCustomer = (cust: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    addAuditLog('CREATE_CUSTOMER', 'Customer', newCust.id, `Added customer ${newCust.name}`);
    showToast('success', 'Customer Added', `${newCust.name} successfully registered.`);
  };

  const addVendor = (vend: Omit<Vendor, 'id' | 'createdAt'>) => {
    const newVend: Vendor = {
      ...vend,
      id: `vend-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setVendors((prev) => [newVend, ...prev]);
    addAuditLog('CREATE_VENDOR', 'Vendor', newVend.id, `Added vendor ${newVend.name}`);
    showToast('success', 'Vendor Added', `${newVend.name} successfully registered.`);
  };

  // 1. Create Sales Invoice
  const createSalesInvoice = (invData: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'status' | 'paidAmount' | 'balanceAmount' | 'createdAt' | 'createdBy'>) => {
    const invoiceNum = `${company.invoicePrefix}${company.nextInvoiceNumber}`;
    const newInvoice: SalesInvoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      paidAmount: 0,
      balanceAmount: invData.grandTotal,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      createdBy: `${currentRole.toLowerCase().replace(' ', '_')}@acmetech.io`,
    };

    setCompany((prev) => ({ ...prev, nextInvoiceNumber: prev.nextInvoiceNumber + 1 }));
    setInvoices((prev) => [newInvoice, ...prev]);
    addAuditLog('CREATE_INVOICE_DRAFT', 'SalesInvoice', newInvoice.id, `Created draft invoice ${invoiceNum}`);
    showToast('success', 'Invoice Draft Created', `Invoice ${invoiceNum} created.`);
    return newInvoice.id;
  };

  // 2. Post Sales Invoice (Atomic Double-Entry Posting!)
  const postSalesInvoice = (invoiceId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return false;
    if (invoice.status !== 'Draft') {
      showToast('error', 'Posting Failed', 'Invoice is already posted.');
      return false;
    }

    const customer = customers.find((c) => c.id === invoice.customerId);
    const journalSeq = journalEntries.length + 1;
    const journalNumber = `JRN-2026-${String(journalSeq).padStart(4, '0')}`;

    // Journal Lines:
    // DR Accounts Receivable (acc-1030) for grandTotal
    // CR Revenue Account for line items subtotal
    // CR Output GST Payable (acc-2020) for taxAmount
    const lines = [
      {
        id: `jl-${Date.now()}-1`,
        accountId: 'acc-1030', // Accounts Receivable
        debit: invoice.grandTotal,
        credit: 0,
        description: `Accounts Receivable for ${invoice.invoiceNumber} (${customer?.name || ''})`,
      },
    ];

    // Group revenues by account
    invoice.lines.forEach((line, idx) => {
      lines.push({
        id: `jl-${Date.now()}-rev-${idx}`,
        accountId: line.revenueAccountId,
        debit: 0,
        credit: line.subtotal,
        description: line.description,
      });
    });

    if (invoice.taxAmount > 0) {
      lines.push({
        id: `jl-${Date.now()}-tax`,
        accountId: 'acc-2020', // Output GST Payable
        debit: 0,
        credit: invoice.taxAmount,
        description: `Output GST on ${invoice.invoiceNumber}`,
      });
    }

    const totalDebit = lines.reduce((acc, l) => acc + l.debit, 0);
    const totalCredit = lines.reduce((acc, l) => acc + l.credit, 0);

    // Strict Double-Entry Invariant Validation
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      showToast('error', 'Atomic Posting Violation', `Debit (${totalDebit}) does not equal Credit (${totalCredit})!`);
      return false;
    }

    const newJournal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      journalNumber,
      transactionDate: invoice.invoiceDate,
      description: `Posting Sales Invoice ${invoice.invoiceNumber} for ${customer?.name || 'Customer'}`,
      sourceType: 'SalesInvoice',
      sourceId: invoice.id,
      status: 'Posted',
      totalDebit,
      totalCredit,
      isReversed: false,
      postedBy: `${currentRole.toLowerCase().replace(' ', '_')}@acmetech.io`,
      postedAt: new Date().toISOString(),
      lines,
    };

    setJournalEntries((prev) => [newJournal, ...prev]);
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? { ...i, status: 'Posted', postedJournalEntryId: newJournal.id }
          : i
      )
    );

    addAuditLog('POST_SALES_INVOICE', 'SalesInvoice', invoice.id, `Posted invoice ${invoice.invoiceNumber}. Created journal ${journalNumber}.`);
    showToast('success', 'Invoice Posted Atomically', `Invoice ${invoice.invoiceNumber} committed to General Ledger via ${journalNumber}.`);
    return true;
  };

  // 3. Record Customer Receipt
  const recordCustomerReceipt = (
    invoiceId: string,
    bankAccountId: string,
    amount: number,
    paymentMethod: any,
    referenceNumber: string
  ) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    const bank = bankAccounts.find((b) => b.id === bankAccountId);
    if (!invoice || !bank) return false;

    if (amount <= 0 || amount > invoice.balanceAmount) {
      showToast('error', 'Invalid Allocation', `Amount must be between 1 and ₹${invoice.balanceAmount.toLocaleString('en-IN')}`);
      return false;
    }

    const receiptSeq = payments.filter((p) => p.paymentType === 'Receipt').length + 1;
    const paymentNumber = `REC-2026-${String(receiptSeq).padStart(4, '0')}`;
    const journalSeq = journalEntries.length + 1;
    const journalNumber = `JRN-2026-${String(journalSeq).padStart(4, '0')}`;

    // Double-entry journal:
    // DR Bank Account (Asset) for amount
    // CR Accounts Receivable (Asset) for amount
    const lines = [
      {
        id: `jl-${Date.now()}-b`,
        accountId: bank.linkedAccountId,
        debit: amount,
        credit: 0,
        description: `Funds received in ${bank.bankName} (${referenceNumber})`,
      },
      {
        id: `jl-${Date.now()}-ar`,
        accountId: 'acc-1030', // Accounts Receivable
        debit: 0,
        credit: amount,
        description: `Clear Accounts Receivable for ${invoice.invoiceNumber}`,
      },
    ];

    const newJournal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      journalNumber,
      transactionDate: new Date().toISOString().split('T')[0],
      description: `Customer Receipt ${paymentNumber} for ${invoice.invoiceNumber}`,
      sourceType: 'CustomerReceipt',
      sourceId: `pay-${Date.now()}`,
      status: 'Posted',
      totalDebit: amount,
      totalCredit: amount,
      isReversed: false,
      postedBy: `${currentRole.toLowerCase().replace(' ', '_')}@acmetech.io`,
      postedAt: new Date().toISOString(),
      lines,
    };

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      paymentNumber,
      partyType: 'Customer',
      partyId: invoice.customerId,
      bankAccountId,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentType: 'Receipt',
      paymentMethod,
      amount,
      referenceNumber,
      status: 'Posted',
      allocations: [
        {
          id: `pa-${Date.now()}`,
          documentType: 'SalesInvoice',
          documentId: invoice.id,
          allocatedAmount: amount,
        },
      ],
      postedJournalEntryId: newJournal.id,
      createdAt: new Date().toISOString(),
    };

    // Update balances
    const newPaidAmount = invoice.paidAmount + amount;
    const newBalance = invoice.grandTotal - newPaidAmount;
    const newStatus = newBalance <= 0.01 ? 'Paid' : 'PartiallyPaid';

    setJournalEntries((prev) => [newJournal, ...prev]);
    setPayments((prev) => [newPayment, ...prev]);
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? { ...i, paidAmount: newPaidAmount, balanceAmount: newBalance, status: newStatus }
          : i
      )
    );
    setBankAccounts((prev) =>
      prev.map((b) =>
        b.id === bankAccountId
          ? { ...b, currentBalance: b.currentBalance + amount }
          : b
      )
    );

    addAuditLog('RECORD_CUSTOMER_RECEIPT', 'Payment', newPayment.id, `Recorded receipt ${paymentNumber} of ₹${amount} against ${invoice.invoiceNumber}`);
    showToast('success', 'Receipt Recorded', `Payment of ₹${amount.toLocaleString('en-IN')} recorded for ${invoice.invoiceNumber}.`);
    return true;
  };

  // 4. Create Purchase Bill
  const createPurchaseBill = (billData: Omit<PurchaseBill, 'id' | 'billNumber' | 'paidAmount' | 'balanceAmount' | 'status' | 'createdAt'>) => {
    const billNum = `${company.billPrefix}${company.nextBillNumber}`;
    const newBill: PurchaseBill = {
      ...billData,
      id: `bill-${Date.now()}`,
      billNumber: billNum,
      paidAmount: 0,
      balanceAmount: billData.grandTotal,
      status: 'Draft',
      createdAt: new Date().toISOString(),
    };

    setCompany((prev) => ({ ...prev, nextBillNumber: prev.nextBillNumber + 1 }));
    setBills((prev) => [newBill, ...prev]);
    addAuditLog('CREATE_PURCHASE_BILL', 'PurchaseBill', newBill.id, `Created draft bill ${billNum}`);
    showToast('success', 'Bill Created', `Vendor Bill ${billNum} created.`);
    return newBill.id;
  };

  // 5. Post Purchase Bill
  const postPurchaseBill = (billId: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill || bill.status !== 'Draft') return false;

    const vendor = vendors.find((v) => v.id === bill.vendorId);
    const journalSeq = journalEntries.length + 1;
    const journalNumber = `JRN-2026-${String(journalSeq).padStart(4, '0')}`;

    // Journal Lines:
    // DR Expense Account for subtotal
    // DR Input Tax Credit (acc-1040) for taxAmount
    // CR Accounts Payable (acc-2010) for grandTotal
    const lines = [];

    bill.lines.forEach((line, idx) => {
      lines.push({
        id: `jl-${Date.now()}-exp-${idx}`,
        accountId: line.expenseAccountId,
        debit: line.subtotal,
        credit: 0,
        description: line.description,
      });
    });

    if (bill.taxAmount > 0) {
      lines.push({
        id: `jl-${Date.now()}-itc`,
        accountId: 'acc-1040', // Input Tax Credit
        debit: bill.taxAmount,
        credit: 0,
        description: `Input Tax Credit on ${bill.billNumber}`,
      });
    }

    lines.push({
      id: `jl-${Date.now()}-ap`,
      accountId: 'acc-2010', // Accounts Payable
      debit: 0,
      credit: bill.grandTotal,
      description: `Accounts Payable to ${vendor?.name || 'Vendor'} (${bill.billNumber})`,
    });

    const totalDebit = lines.reduce((acc, l) => acc + l.debit, 0);
    const totalCredit = lines.reduce((acc, l) => acc + l.credit, 0);

    const newJournal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      journalNumber,
      transactionDate: bill.billDate,
      description: `Posting Purchase Bill ${bill.billNumber} from ${vendor?.name || 'Vendor'}`,
      sourceType: 'PurchaseBill',
      sourceId: bill.id,
      status: 'Posted',
      totalDebit,
      totalCredit,
      isReversed: false,
      postedBy: `${currentRole.toLowerCase().replace(' ', '_')}@acmetech.io`,
      postedAt: new Date().toISOString(),
      lines,
    };

    setJournalEntries((prev) => [newJournal, ...prev]);
    setBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, status: 'Posted', postedJournalEntryId: newJournal.id } : b))
    );

    addAuditLog('POST_PURCHASE_BILL', 'PurchaseBill', bill.id, `Posted vendor bill ${bill.billNumber}. Created journal ${journalNumber}.`);
    showToast('success', 'Bill Posted', `Bill ${bill.billNumber} committed to General Ledger.`);
    return true;
  };

  // 6. Record Vendor Payment
  const recordVendorPayment = (
    billId: string,
    bankAccountId: string,
    amount: number,
    paymentMethod: any,
    referenceNumber: string
  ) => {
    const bill = bills.find((b) => b.id === billId);
    const bank = bankAccounts.find((b) => b.id === bankAccountId);
    if (!bill || !bank) return false;

    if (amount <= 0 || amount > bill.balanceAmount) {
      showToast('error', 'Invalid Payment Amount', `Amount must be between 1 and ₹${bill.balanceAmount.toLocaleString('en-IN')}`);
      return false;
    }

    const paySeq = payments.filter((p) => p.paymentType === 'Payment').length + 1;
    const paymentNumber = `PAY-2026-${String(paySeq).padStart(4, '0')}`;
    const journalSeq = journalEntries.length + 1;
    const journalNumber = `JRN-2026-${String(journalSeq).padStart(4, '0')}`;

    // Double-Entry:
    // DR Accounts Payable (acc-2010)
    // CR Bank Account
    const lines = [
      {
        id: `jl-${Date.now()}-ap`,
        accountId: 'acc-2010', // Accounts Payable
        debit: amount,
        credit: 0,
        description: `Settlement of Accounts Payable for ${bill.billNumber}`,
      },
      {
        id: `jl-${Date.now()}-b`,
        accountId: bank.linkedAccountId,
        debit: 0,
        credit: amount,
        description: `Debit from ${bank.bankName} (${referenceNumber})`,
      },
    ];

    const newJournal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      journalNumber,
      transactionDate: new Date().toISOString().split('T')[0],
      description: `Vendor Payment ${paymentNumber} for ${bill.billNumber}`,
      sourceType: 'VendorPayment',
      sourceId: `pay-${Date.now()}`,
      status: 'Posted',
      totalDebit: amount,
      totalCredit: amount,
      isReversed: false,
      postedBy: `${currentRole.toLowerCase().replace(' ', '_')}@acmetech.io`,
      postedAt: new Date().toISOString(),
      lines,
    };

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      paymentNumber,
      partyType: 'Vendor',
      partyId: bill.vendorId,
      bankAccountId,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentType: 'Payment',
      paymentMethod,
      amount,
      referenceNumber,
      status: 'Posted',
      allocations: [
        {
          id: `pa-${Date.now()}`,
          documentType: 'PurchaseBill',
          documentId: bill.id,
          allocatedAmount: amount,
        },
      ],
      postedJournalEntryId: newJournal.id,
      createdAt: new Date().toISOString(),
    };

    const newPaidAmount = bill.paidAmount + amount;
    const newBalance = bill.grandTotal - newPaidAmount;
    const newStatus = newBalance <= 0.01 ? 'Paid' : 'Posted';

    setJournalEntries((prev) => [newJournal, ...prev]);
    setPayments((prev) => [newPayment, ...prev]);
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId ? { ...b, paidAmount: newPaidAmount, balanceAmount: newBalance, status: newStatus } : b
      )
    );
    setBankAccounts((prev) =>
      prev.map((b) =>
        b.id === bankAccountId ? { ...b, currentBalance: b.currentBalance - amount } : b
      )
    );

    addAuditLog('RECORD_VENDOR_PAYMENT', 'Payment', newPayment.id, `Paid ₹${amount} against vendor bill ${bill.billNumber}`);
    showToast('success', 'Vendor Payment Recorded', `Paid ₹${amount.toLocaleString('en-IN')} for bill ${bill.billNumber}.`);
    return true;
  };

  // 7. Create Direct Expense
  const createExpense = (expenseData: Omit<ExpenseRecord, 'id' | 'status' | 'createdAt'>) => {
    const journalSeq = journalEntries.length + 1;
    const journalNumber = `JRN-2026-${String(journalSeq).padStart(4, '0')}`;
    const expAccount = accounts.find((a) => a.id === expenseData.expenseAccountId);

    // Double-entry journal:
    // DR Expense Account
    // CR Bank/Cash Account
    const lines = [
      {
        id: `jl-${Date.now()}-exp`,
        accountId: expenseData.expenseAccountId,
        debit: expenseData.totalAmount,
        credit: 0,
        description: expenseData.description,
      },
      {
        id: `jl-${Date.now()}-pmt`,
        accountId: expenseData.paymentAccountId,
        debit: 0,
        credit: expenseData.totalAmount,
        description: `Payment for ${expenseData.description}`,
      },
    ];

    const newJournal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      journalNumber,
      transactionDate: expenseData.expenseDate,
      description: `Direct Expense: ${expenseData.description}`,
      sourceType: 'Expense',
      sourceId: `exp-${Date.now()}`,
      status: 'Posted',
      totalDebit: expenseData.totalAmount,
      totalCredit: expenseData.totalAmount,
      isReversed: false,
      postedBy: `${currentRole.toLowerCase().replace(' ', '_')}@acmetech.io`,
      postedAt: new Date().toISOString(),
      lines,
    };

    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      status: 'Posted',
      postedJournalEntryId: newJournal.id,
      createdAt: new Date().toISOString(),
    };

    setJournalEntries((prev) => [newJournal, ...prev]);
    setExpenses((prev) => [newExpense, ...prev]);

    // Update bank balance if paid from a linked bank account
    setBankAccounts((prev) =>
      prev.map((b) =>
        b.linkedAccountId === expenseData.paymentAccountId
          ? { ...b, currentBalance: b.currentBalance - expenseData.totalAmount }
          : b
      )
    );

    addAuditLog('POST_EXPENSE', 'Expense', newExpense.id, `Recorded expense of ₹${expenseData.totalAmount} (${expAccount?.name || ''})`);
    showToast('success', 'Expense Recorded', `Expense of ₹${expenseData.totalAmount.toLocaleString('en-IN')} posted to ledger.`);
    return true;
  };

  // 8. Create Manual Journal Entry
  const postManualJournal = (
    description: string,
    lines: { accountId: string; debit: number; credit: number; description: string }[]
  ) => {
    const totalDebit = lines.reduce((acc, l) => acc + l.debit, 0);
    const totalCredit = lines.reduce((acc, l) => acc + l.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      showToast('error', 'Unbalanced Journal', `Debit (₹${totalDebit}) does not equal Credit (₹${totalCredit})!`);
      return false;
    }
    if (totalDebit <= 0) {
      showToast('error', 'Invalid Amounts', 'Journal entries must have amounts greater than 0.');
      return false;
    }

    const journalSeq = journalEntries.length + 1;
    const journalNumber = `JRN-2026-${String(journalSeq).padStart(4, '0')}`;

    const newJournal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      journalNumber,
      transactionDate: new Date().toISOString().split('T')[0],
      description,
      sourceType: 'ManualJournal',
      status: 'Posted',
      totalDebit,
      totalCredit,
      isReversed: false,
      postedBy: `${currentRole.toLowerCase().replace(' ', '_')}@acmetech.io`,
      postedAt: new Date().toISOString(),
      lines: lines.map((l, i) => ({
        id: `jl-${Date.now()}-${i}`,
        ...l,
      })),
    };

    setJournalEntries((prev) => [newJournal, ...prev]);
    addAuditLog('POST_MANUAL_JOURNAL', 'JournalEntry', newJournal.id, `Manual journal ${journalNumber} posted: ${description}`);
    showToast('success', 'Journal Entry Posted', `Journal ${journalNumber} committed to ledger.`);
    return true;
  };

  // 9. Reverse Journal Entry (Audit-proof correction without silent delete)
  const reverseJournalEntry = (journalId: string) => {
    const target = journalEntries.find((j) => j.id === journalId);
    if (!target) return false;
    if (target.isReversed) {
      showToast('error', 'Already Reversed', 'This journal entry has already been reversed.');
      return false;
    }

    const reversalSeq = journalEntries.length + 1;
    const reversalNumber = `REV-${target.journalNumber}`;

    // Swap debits and credits
    const reversalLines = target.lines.map((line, idx) => ({
      id: `rev-line-${Date.now()}-${idx}`,
      accountId: line.accountId,
      debit: line.credit, // swap!
      credit: line.debit, // swap!
      description: `Reversal of [${target.journalNumber}]: ${line.description}`,
    }));

    const reversalEntry: JournalEntry = {
      id: `jrn-${Date.now()}`,
      journalNumber: reversalNumber,
      transactionDate: new Date().toISOString().split('T')[0],
      description: `REVERSAL of ${target.journalNumber}: ${target.description}`,
      sourceType: target.sourceType,
      sourceId: target.id,
      status: 'Posted',
      totalDebit: target.totalCredit,
      totalCredit: target.totalDebit,
      isReversed: false,
      postedBy: `${currentRole.toLowerCase().replace(' ', '_')}@acmetech.io`,
      postedAt: new Date().toISOString(),
      lines: reversalLines,
    };

    setJournalEntries((prev) =>
      prev
        .map((j) => (j.id === journalId ? { ...j, isReversed: true, reversedByJournalId: reversalEntry.id } : j))
        .concat(reversalEntry)
    );

    addAuditLog('REVERSE_JOURNAL', 'JournalEntry', target.id, `Reversed journal ${target.journalNumber} via ${reversalNumber}`);
    showToast('info', 'Journal Reversed', `Offsetting reversal journal ${reversalNumber} has been posted.`);
    return true;
  };

  // 10. Transfer Between Bank Accounts (Guaranteed Zero Revenue/Expense distortion)
  const transferBetweenBanks = (
    fromBankId: string,
    toBankId: string,
    amount: number,
    refNumber: string
  ) => {
    if (fromBankId === toBankId) {
      showToast('error', 'Invalid Transfer', 'Source and destination bank accounts cannot be the same.');
      return false;
    }
    const fromBank = bankAccounts.find((b) => b.id === fromBankId);
    const toBank = bankAccounts.find((b) => b.id === toBankId);
    if (!fromBank || !toBank) return false;

    if (amount <= 0 || amount > fromBank.currentBalance) {
      showToast('error', 'Insufficient Funds', `Cannot transfer ₹${amount}. Available: ₹${fromBank.currentBalance.toLocaleString('en-IN')}`);
      return false;
    }

    const journalSeq = journalEntries.length + 1;
    const journalNumber = `JRN-2026-${String(journalSeq).padStart(4, '0')}`;

    // Internal Transfer: DR Destination Bank, CR Source Bank
    const lines = [
      {
        id: `jl-${Date.now()}-to`,
        accountId: toBank.linkedAccountId,
        debit: amount,
        credit: 0,
        description: `Internal Transfer from ${fromBank.bankName} (${refNumber})`,
      },
      {
        id: `jl-${Date.now()}-from`,
        accountId: fromBank.linkedAccountId,
        debit: 0,
        credit: amount,
        description: `Internal Transfer to ${toBank.bankName} (${refNumber})`,
      },
    ];

    const newJournal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      journalNumber,
      transactionDate: new Date().toISOString().split('T')[0],
      description: `Internal Bank Transfer: ${fromBank.bankName} -> ${toBank.bankName}`,
      sourceType: 'BankTransfer',
      status: 'Posted',
      totalDebit: amount,
      totalCredit: amount,
      isReversed: false,
      postedBy: `${currentRole.toLowerCase().replace(' ', '_')}@acmetech.io`,
      postedAt: new Date().toISOString(),
      lines,
    };

    setJournalEntries((prev) => [newJournal, ...prev]);
    setBankAccounts((prev) =>
      prev.map((b) => {
        if (b.id === fromBankId) return { ...b, currentBalance: b.currentBalance - amount };
        if (b.id === toBankId) return { ...b, currentBalance: b.currentBalance + amount };
        return b;
      })
    );

    addAuditLog('INTERNAL_BANK_TRANSFER', 'BankAccount', fromBank.id, `Transferred ₹${amount} from ${fromBank.bankName} to ${toBank.bankName}`);
    showToast('success', 'Transfer Completed', `₹${amount.toLocaleString('en-IN')} transferred without revenue/expense distortion.`);
    return true;
  };

  // --- REPORTING CALCULATORS ---

  // 1. General Ledger
  const getGeneralLedger = (accountId: string): GeneralLedgerRow[] => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return [];

    const rows: GeneralLedgerRow[] = [];
    let runningBalance = 0;

    // Sort journals chronologically
    const sortedJournals = [...journalEntries]
      .filter((j) => j.status === 'Posted')
      .sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());

    sortedJournals.forEach((j) => {
      j.lines
        .filter((l) => l.accountId === accountId)
        .forEach((l) => {
          if (account.normalBalance === 'Debit') {
            runningBalance += l.debit - l.credit;
          } else {
            runningBalance += l.credit - l.debit;
          }

          rows.push({
            date: j.transactionDate,
            journalNumber: j.journalNumber,
            sourceType: j.sourceType,
            description: l.description || j.description,
            debit: l.debit,
            credit: l.credit,
            balance: runningBalance,
          });
        });
    });

    return rows;
  };

  // 2. Trial Balance
  const getTrialBalance = () => {
    const balanceMap: Record<string, { debit: number; credit: number }> = {};

    accounts.forEach((acc) => {
      balanceMap[acc.id] = { debit: 0, credit: 0 };
    });

    journalEntries
      .filter((j) => j.status === 'Posted')
      .forEach((j) => {
        j.lines.forEach((l) => {
          if (balanceMap[l.accountId]) {
            balanceMap[l.accountId].debit += l.debit;
            balanceMap[l.accountId].credit += l.credit;
          }
        });
      });

    const items: TrialBalanceItem[] = accounts.map((acc) => {
      const { debit, credit } = balanceMap[acc.id] || { debit: 0, credit: 0 };
      let debitBalance = 0;
      let creditBalance = 0;

      if (acc.normalBalance === 'Debit') {
        const net = debit - credit;
        if (net >= 0) debitBalance = net;
        else creditBalance = Math.abs(net);
      } else {
        const net = credit - debit;
        if (net >= 0) creditBalance = net;
        else debitBalance = Math.abs(net);
      }

      return {
        accountId: acc.id,
        code: acc.code,
        name: acc.name,
        category: acc.category,
        normalBalance: acc.normalBalance,
        debitBalance,
        creditBalance,
      };
    });

    const totalDebit = items.reduce((acc, i) => acc + i.debitBalance, 0);
    const totalCredit = items.reduce((acc, i) => acc + i.creditBalance, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.05;

    return { items, totalDebit, totalCredit, isBalanced };
  };

  // 3. Profit and Loss
  const getProfitAndLoss = () => {
    const { items } = getTrialBalance();

    const revenueRows = items.filter((i) => i.category === 'Revenue');
    const expenseRows = items.filter((i) => i.category === 'Expense');

    const revenueTotal = revenueRows.reduce((acc, r) => acc + r.creditBalance, 0);
    const expensesTotal = expenseRows.reduce((acc, e) => acc + e.debitBalance, 0);
    const netProfit = revenueTotal - expensesTotal;

    const revenueItems = revenueRows.map((r) => ({ name: r.name, amount: r.creditBalance }));
    const expenseItems = expenseRows.map((e) => ({ name: e.name, amount: e.debitBalance }));

    return { revenueTotal, expensesTotal, netProfit, revenueItems, expenseItems };
  };

  // 4. Balance Sheet
  const getBalanceSheet = () => {
    const { items } = getTrialBalance();
    const { netProfit } = getProfitAndLoss();

    const assetRows = items.filter((i) => i.category === 'Asset');
    const liabilityRows = items.filter((i) => i.category === 'Liability');
    const equityRows = items.filter((i) => i.category === 'Equity');

    const totalAssets = assetRows.reduce((acc, a) => acc + a.debitBalance, 0);
    const totalLiabilities = liabilityRows.reduce((acc, l) => acc + l.creditBalance, 0);
    const baseEquity = equityRows.reduce((acc, e) => acc + e.creditBalance, 0);
    const totalEquity = baseEquity + netProfit; // Net profit rolls into Retained Earnings

    const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.05;

    const assetItems = assetRows.map((a) => ({ name: a.name, amount: a.debitBalance }));
    const liabilityItems = liabilityRows.map((l) => ({ name: l.name, amount: l.creditBalance }));
    const equityItems = [
      ...equityRows.map((e) => ({ name: e.name, amount: e.creditBalance })),
      { name: 'Current Period Net Earnings (P&L)', amount: netProfit },
    ];

    return { totalAssets, totalLiabilities, totalEquity, netIncome: netProfit, isBalanced, assetItems, liabilityItems, equityItems };
  };

  return (
    <AccountingContext.Provider
      value={{
        company,
        updateCompany,
        accounts,
        addAccount,
        customers,
        addCustomer,
        vendors,
        addVendor,
        bankAccounts,
        invoices,
        bills,
        expenses,
        journalEntries,
        payments,
        auditLogs,
        currentRole,
        setCurrentRole,
        activeSection,
        setActiveSection,
        toasts,
        dismissToast,
        showToast,
        createSalesInvoice,
        postSalesInvoice,
        recordCustomerReceipt,
        createPurchaseBill,
        postPurchaseBill,
        recordVendorPayment,
        createExpense,
        postManualJournal,
        reverseJournalEntry,
        transferBetweenBanks,
        getGeneralLedger,
        getTrialBalance,
        getProfitAndLoss,
        getBalanceSheet,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) throw new Error('useAccounting must be used within an AccountingProvider');
  return context;
};
