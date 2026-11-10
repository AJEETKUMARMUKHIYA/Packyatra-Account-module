import React, { useState } from 'react';
import { Receipt, Plus, CheckCircle, CreditCard, Search, X, Trash2 } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { PurchaseBill, PurchaseBillLine } from '../../types/accounting';

export const PurchaseBillsView: React.FC = () => {
  const { 
    bills, 
    vendors, 
    accounts, 
    bankAccounts, 
    createPurchaseBill, 
    postPurchaseBill, 
    recordVendorPayment 
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [payModalBill, setPayModalBill] = useState<PurchaseBill | null>(null);

  // New Bill State
  const [vendorId, setVendorId] = useState(vendors[0]?.id || '');
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  const [lines, setLines] = useState<PurchaseBillLine[]>([
    {
      id: 'bl-new-1',
      expenseAccountId: accounts.find(a => a.category === 'Expense')?.id || '',
      description: 'AWS Cloud Server Hosting & Database Cluster',
      quantity: 1,
      unitPrice: 20000,
      taxRatePercent: 18,
      subtotal: 20000,
      taxAmount: 3600,
      total: 23600,
    },
  ]);

  // Payment Modal State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentBankId, setPaymentBankId] = useState(bankAccounts[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'NEFT' | 'RTGS' | 'UPI' | 'Cheque'>('NEFT');
  const [paymentRef, setPaymentRef] = useState('');

  const updateLine = (id: string, field: keyof PurchaseBillLine, value: any) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        const updated = { ...line, [field]: value };
        const qty = Number(updated.quantity) || 0;
        const rate = Number(updated.unitPrice) || 0;
        const taxRate = Number(updated.taxRatePercent) || 0;

        const subtotal = qty * rate;
        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;

        return { ...updated, subtotal, taxAmount, total };
      })
    );
  };

  const addLine = () => {
    const expAccount = accounts.find((a) => a.category === 'Expense');
    setLines((prev) => [
      ...prev,
      {
        id: `bl-new-${Date.now()}`,
        expenseAccountId: expAccount?.id || '',
        description: '',
        quantity: 1,
        unitPrice: 0,
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
    createPurchaseBill({
      vendorId,
      vendorInvoiceNumber: vendorInvoiceNumber.trim(),
      billDate,
      dueDate,
      lines,
      subtotal,
      taxAmount,
      grandTotal,
    });
    setVendorInvoiceNumber('');
    setShowCreateModal(false);
  };

  const openPaymentModal = (bill: PurchaseBill) => {
    setPayModalBill(bill);
    setPaymentAmount(bill.balanceAmount);
    setPaymentRef(`UTR-${Date.now().toString().slice(-8)}`);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payModalBill) {
      recordVendorPayment(
        payModalBill.id,
        paymentBankId,
        paymentAmount,
        paymentMethod,
        paymentRef
      );
      setPayModalBill(null);
    }
  };

  const filteredBills = bills.filter((b) => {
    const vendor = vendors.find((v) => v.id === b.vendorId);
    return (
      b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vendorInvoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Receipt className="w-4 h-4" /> Accounts Payable & Vendor Procurement
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Purchase Bills</h2>
          <p className="text-xs text-slate-400 mt-1">
            Capture vendor invoices, claim eligible Input Tax Credits (ITC), post double-entry AP entries, and disburse payments.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Enter Vendor Bill
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search bills by internal #, supplier invoice #, or vendor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Bill #</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Vendor Invoice #</th>
                <th className="py-3 px-4">Bill Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Input Tax (ITC)</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredBills.map((b) => {
                const vendor = vendors.find((v) => v.id === b.vendorId);
                return (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">{b.billNumber}</td>
                    <td className="py-3 px-4 font-semibold text-white max-w-[200px] truncate">{vendor?.name || 'Vendor'}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{b.vendorInvoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{b.billDate}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{b.dueDate}</td>
                    <td className="py-3 px-4 text-right font-mono">₹{b.subtotal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">₹{b.taxAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">₹{b.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      {b.balanceAmount > 0 ? `₹${b.balanceAmount.toLocaleString('en-IN')}` : '₹0.00'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          b.status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'Posted'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {b.status === 'Draft' && (
                          <button
                            onClick={() => postPurchaseBill(b.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Post
                          </button>
                        )}
                        {b.status === 'Posted' && b.balanceAmount > 0 && (
                          <button
                            onClick={() => openPaymentModal(b)}
                            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1"
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

      {/* MODAL 1: Create Purchase Bill */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Enter Vendor Purchase Bill</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Vendor / Supplier</label>
                  <select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    required
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} (GSTIN: {v.gstin || 'None'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Vendor Invoice #</label>
                  <input
                    type="text"
                    placeholder="Supplier bill number"
                    value={vendorInvoiceNumber}
                    onChange={(e) => setVendorInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              {/* Expense Lines */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    Bill Items & Expense Allocation
                  </span>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((line) => (
                    <div key={line.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <div className="md:col-span-4">
                        <input
                          type="text"
                          placeholder="Description"
                          value={line.description}
                          onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                          required
                        />
                      </div>
                      <div className="md:col-span-3">
                        <select
                          value={line.expenseAccountId}
                          onChange={(e) => updateLine(line.id, 'expenseAccountId', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                        >
                          {accounts.filter(a => a.category === 'Expense').map(a => (
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
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          placeholder="Cost (₹)"
                          min="0"
                          value={line.unitPrice}
                          onChange={(e) => updateLine(line.id, 'unitPrice', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white text-right font-mono"
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

              {/* Totals */}
              <div className="flex justify-end pt-3 border-t border-slate-800">
                <div className="w-64 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-white font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Input Tax Credit (ITC):</span>
                    <span className="font-mono text-emerald-400 font-semibold">₹{taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-700 text-sm">
                    <span>Grand Total:</span>
                    <span className="font-mono text-rose-400">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Draft Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Vendor Payment */}
      {payModalBill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Record Vendor Payment</h3>
              </div>
              <button onClick={() => setPayModalBill(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400">Settling Bill: </span>
                <span className="font-bold text-white">{payModalBill.billNumber}</span>
                <div className="text-[11px] text-rose-400 font-mono mt-0.5">
                  Outstanding Payable: ₹{payModalBill.balanceAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={payModalBill.balanceAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Pay From Bank Account</label>
                <select
                  value={paymentBankId}
                  onChange={(e) => setPaymentBankId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} (Available: ₹{b.currentBalance.toLocaleString('en-IN')})
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
                  <label className="font-semibold text-slate-300 block mb-1">Reference (UTR)</label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayModalBill(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Confirm Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
