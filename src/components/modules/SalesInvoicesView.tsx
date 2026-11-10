import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  CheckCircle, 
  CreditCard, 
  Printer, 
  Eye, 
  Trash2, 
  Search, 
  Calendar, 
  AlertCircle,
  Building,
  ArrowRight,
  X
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { SalesInvoice, InvoiceLineItem } from '../../types/accounting';

export const SalesInvoicesView: React.FC = () => {
  const { 
    company, 
    invoices, 
    customers, 
    accounts, 
    bankAccounts,
    createSalesInvoice, 
    postSalesInvoice, 
    recordCustomerReceipt 
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<SalesInvoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<SalesInvoice | null>(null);

  // New Invoice Form State
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [placeOfSupply, setPlaceOfSupply] = useState('27-Maharashtra');
  const [lines, setLines] = useState<InvoiceLineItem[]>([
    {
      id: 'l-new-1',
      revenueAccountId: accounts.find(a => a.category === 'Revenue')?.id || '',
      description: 'Software Engineering & Cloud Architecture Consulting',
      quantity: 1,
      unitPrice: 50000,
      discountAmount: 0,
      taxRatePercent: 18,
      subtotal: 50000,
      taxAmount: 9000,
      total: 59000,
    },
  ]);

  // Payment Recording State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentBankId, setPaymentBankId] = useState(bankAccounts[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'NEFT' | 'RTGS' | 'UPI' | 'Cheque'>('NEFT');
  const [paymentRef, setPaymentRef] = useState('');

  // Update line calculations
  const updateLine = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        const updated = { ...line, [field]: value };
        const qty = Number(updated.quantity) || 0;
        const rate = Number(updated.unitPrice) || 0;
        const disc = Number(updated.discountAmount) || 0;
        const taxRate = Number(updated.taxRatePercent) || 0;

        const subtotal = Math.max(0, qty * rate - disc);
        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;

        return { ...updated, subtotal, taxAmount, total };
      })
    );
  };

  const addLine = () => {
    const revAccount = accounts.find((a) => a.category === 'Revenue');
    setLines((prev) => [
      ...prev,
      {
        id: `l-new-${Date.now()}`,
        revenueAccountId: revAccount?.id || '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountAmount: 0,
        taxRatePercent: 18,
        subtotal: 0,
        taxAmount: 0,
        total: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const subtotal = lines.reduce((acc, l) => acc + l.subtotal, 0);
  const taxAmount = lines.reduce((acc, l) => acc + l.taxAmount, 0);
  const grandTotal = subtotal + taxAmount;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSalesInvoice({
      customerId,
      invoiceDate,
      dueDate,
      placeOfSupply,
      currency: company.currencyCode,
      lines,
      subtotal,
      taxAmount,
      grandTotal,
    });
    setShowCreateModal(false);
  };

  const openPaymentModal = (inv: SalesInvoice) => {
    setPaymentModalInvoice(inv);
    setPaymentAmount(inv.balanceAmount);
    setPaymentRef(`UTR-${Date.now().toString().slice(-8)}`);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentModalInvoice) {
      recordCustomerReceipt(
        paymentModalInvoice.id,
        paymentBankId,
        paymentAmount,
        paymentMethod,
        paymentRef
      );
      setPaymentModalInvoice(null);
    }
  };

  const filteredInvoices = invoices.filter((i) => {
    const customer = customers.find((c) => c.id === i.customerId);
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <FileText className="w-4 h-4" /> Revenue & Accounts Receivable Management
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Sales Invoices</h2>
          <p className="text-xs text-slate-400 mt-1">
            Create authoritative invoices, calculate GST (CGST/SGST/IGST), post balanced double-entry journals, and record customer receipts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Sales Invoice
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search by invoice number or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Invoices</option>
            <option value="Draft">Draft</option>
            <option value="Posted">Posted (Unpaid)</option>
            <option value="PartiallyPaid">Partially Paid</option>
            <option value="Paid">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Invoice Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Taxable Subtotal</th>
                <th className="py-3 px-4 text-right">GST Tax</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInvoices.map((inv) => {
                const customer = customers.find((c) => c.id === inv.customerId);
                return (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-white max-w-[200px] truncate" title={customer?.name}>
                      {customer?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{inv.invoiceDate}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{inv.dueDate}</td>
                    <td className="py-3 px-4 text-right font-mono">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">₹{inv.taxAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {inv.balanceAmount > 0 ? `₹${inv.balanceAmount.toLocaleString('en-IN')}` : '₹0.00'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : inv.status === 'Posted'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : inv.status === 'PartiallyPaid'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Preview Button */}
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                          title="View Tax Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Post to Ledger Button (for draft) */}
                        {inv.status === 'Draft' && (
                          <button
                            onClick={() => postSalesInvoice(inv.id)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                            title="Post double-entry journal to ledger"
                          >
                            <CheckCircle className="w-3 h-3" /> Post
                          </button>
                        )}

                        {/* Record Payment Button */}
                        {(inv.status === 'Posted' || inv.status === 'PartiallyPaid') && inv.balanceAmount > 0 && (
                          <button
                            onClick={() => openPaymentModal(inv)}
                            className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                            title="Record Customer Receipt"
                          >
                            <CreditCard className="w-3 h-3" /> Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create Sales Invoice */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Create New Sales Invoice</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Customer</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (GSTIN: {c.gstin || 'None'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Place of Supply</label>
                <input
                  type="text"
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  placeholder="e.g. 27-Maharashtra or 29-Karnataka"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Line Items Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Invoice Line Items
                  </label>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div key={line.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 grid grid-cols-1 md:grid-cols-12 gap-2 text-xs items-center">
                      <div className="md:col-span-4">
                        <input
                          type="text"
                          placeholder="Item Description"
                          value={line.description}
                          onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <select
                          value={line.revenueAccountId}
                          onChange={(e) => updateLine(line.id, 'revenueAccountId', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                          required
                        >
                          {accounts.filter(a => a.category === 'Revenue').map(a => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-1">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white text-right"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          placeholder="Rate (₹)"
                          min="0"
                          value={line.unitPrice}
                          onChange={(e) => updateLine(line.id, 'unitPrice', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white text-right"
                          required
                        />
                      </div>
                      <div className="md:col-span-1">
                        <select
                          value={line.taxRatePercent}
                          onChange={(e) => updateLine(line.id, 'taxRatePercent', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </div>
                      <div className="md:col-span-1 text-right font-mono font-bold text-white">
                        ₹{line.total.toLocaleString('en-IN')}
                      </div>
                      <div className="md:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-3 border-t border-slate-800">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono text-white font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Applicable GST:</span>
                    <span className="font-mono text-white font-semibold">₹{taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-700">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-400">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
                >
                  Save Draft Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Customer Payment Receipt */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Record Customer Receipt</h3>
              </div>
              <button onClick={() => setPaymentModalInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400">Invoice: </span>
                <span className="font-bold text-white">{paymentModalInvoice.invoiceNumber}</span>
                <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                  Outstanding Balance: ₹{paymentModalInvoice.balanceAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Receipt Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={paymentModalInvoice.balanceAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Deposit Into Bank Account</label>
                <select
                  value={paymentBankId}
                  onChange={(e) => setPaymentBankId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} (Current: ₹{b.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Bank Reference (UTR)</label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    placeholder="UTR number"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-[11px]">
                Posting this payment automatically creates an atomic journal entry: DR Bank Account, CR Accounts Receivable.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20"
                >
                  Confirm & Post Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Printable Tax Invoice Preview */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto print:p-0">
            {/* Top Bar with print button */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Commercial Tax Invoice Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button onClick={() => setPreviewInvoice(null)} className="p-1 text-slate-500 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tax Invoice Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{company.legalName}</h1>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">{company.address}</p>
                <div className="text-xs text-slate-700 mt-2 space-y-0.5">
                  <div><strong>GSTIN:</strong> {company.gstin}</div>
                  <div><strong>PAN:</strong> {company.pan}</div>
                  <div><strong>Email:</strong> {company.email}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-indigo-900">TAX INVOICE</div>
                <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                  Invoice #: {previewInvoice.invoiceNumber}
                </div>
                <div className="text-xs text-slate-600 mt-1">Date: {previewInvoice.invoiceDate}</div>
                <div className="text-xs text-slate-600">Due Date: {previewInvoice.dueDate}</div>
                <div className="text-xs text-slate-600">Place of Supply: {previewInvoice.placeOfSupply}</div>
              </div>
            </div>

            {/* Bill To */}
            {(() => {
              const cust = customers.find((c) => c.id === previewInvoice.customerId);
              return (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Bill To Customer</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{cust?.name}</div>
                  <p className="text-xs text-slate-600 mt-0.5">{cust?.billingAddress}</p>
                  <div className="text-xs text-slate-700 mt-1 flex gap-4">
                    <span><strong>GSTIN:</strong> {cust?.gstin || 'N/A'}</span>
                    <span><strong>PAN:</strong> {cust?.pan || 'N/A'}</span>
                  </div>
                </div>
              );
            })()}

            {/* Itemized Table */}
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 uppercase text-[10px] text-slate-700">
                <tr>
                  <th className="p-2.5">Item & Description</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Unit Price</th>
                  <th className="p-2.5 text-right">GST Rate</th>
                  <th className="p-2.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {previewInvoice.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="p-2.5 font-medium">{l.description}</td>
                    <td className="p-2.5 text-center font-mono">{l.quantity}</td>
                    <td className="p-2.5 text-right font-mono">₹{l.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono">{l.taxRatePercent}%</td>
                    <td className="p-2.5 text-right font-mono font-bold">₹{l.total.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & Bank details */}
            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800">Bank Settlement Details (NEFT/RTGS):</div>
                <div className="text-slate-600">Bank: {bankAccounts[0]?.bankName}</div>
                <div className="text-slate-600 font-mono">A/C: {bankAccounts[0]?.accountNumber}</div>
                <div className="text-slate-600 font-mono">IFSC: {bankAccounts[0]?.ifscCode}</div>
              </div>

              <div className="space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Taxable):</span>
                  <span className="font-mono font-semibold">₹{previewInvoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Tax Breakdown:</span>
                  <span className="font-mono font-semibold">₹{previewInvoice.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t">
                  <span>Grand Total:</span>
                  <span className="font-mono text-indigo-900">₹{previewInvoice.grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-emerald-700">
                  <span>Amount Paid:</span>
                  <span className="font-mono">₹{previewInvoice.paidAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-amber-700">
                  <span>Outstanding Balance:</span>
                  <span className="font-mono">₹{previewInvoice.balanceAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
