import React, { useState } from 'react';
import { Truck, Plus, Search, Mail, Phone, MapPin, X, Receipt } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

export const VendorsView: React.FC = () => {
  const { vendors, bills, addVendor } = useAccounting();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Vendor Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState(15);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVendor({
      name,
      contactPerson,
      email,
      phone,
      address,
      gstin: gstin.toUpperCase(),
      pan: pan.toUpperCase(),
      paymentTermsDays: Number(paymentTermsDays) || 15,
      isActive: true,
    });
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
    setGstin('');
    setPan('');
    setShowAddModal(false);
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.gstin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Truck className="w-4 h-4" /> Supplier & Vendor Directory
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Vendor Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Maintain suppliers, IT vendors, office facilities, payment terms, and accounts payable balances.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search vendors by name, email, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vend) => {
          const vendBills = bills.filter((b) => b.vendorId === vend.id);
          const totalBilled = vendBills.reduce((acc, b) => acc + b.grandTotal, 0);
          const outstandingPayable = vendBills.reduce((acc, b) => acc + b.balanceAmount, 0);

          return (
            <div
              key={vend.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-sm line-clamp-1">{vend.name}</h3>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono shrink-0">
                    Net {vend.paymentTermsDays}d
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Contact: {vend.contactPerson || 'N/A'}</div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{vend.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{vend.phone || '—'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{vend.address || '—'}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] flex justify-between text-slate-400 font-mono">
                  <span>GSTIN: <strong className="text-slate-300">{vend.gstin || '—'}</strong></span>
                  <span>PAN: <strong className="text-slate-300">{vend.pan || '—'}</strong></span>
                </div>
              </div>

              {/* Financial Balance Summary */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-950/40 -mx-5 -mb-5 p-4 rounded-b-xl flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Total Billed</div>
                  <div className="font-mono font-bold text-white">₹{totalBilled.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase">Accounts Payable</div>
                  <div className={`font-mono font-bold ${outstandingPayable > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ₹{outstandingPayable.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Add Vendor */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Add New Supplier / Vendor</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Vendor / Entity Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Web Services India Pvt Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Full name or Billing Desk"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="billing@vendor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Payment Terms (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={paymentTermsDays}
                    onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">GSTIN</label>
                  <input
                    type="text"
                    placeholder="15-digit GSTIN"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">PAN</label>
                  <input
                    type="text"
                    placeholder="10-digit PAN"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Office / Remittance Address</label>
                <textarea
                  rows={2}
                  placeholder="Registered address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
