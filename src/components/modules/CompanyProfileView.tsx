import React, { useState } from 'react';
import { Building2, Save, CheckCircle2, ShieldCheck, Calendar, FileText } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

export const CompanyProfileView: React.FC = () => {
  const { company, updateCompany } = useAccounting();

  const [legalName, setLegalName] = useState(company.legalName);
  const [tradeName, setTradeName] = useState(company.tradeName);
  const [pan, setPan] = useState(company.pan);
  const [gstin, setGstin] = useState(company.gstin);
  const [currencyCode, setCurrencyCode] = useState(company.currencyCode);
  const [currencySymbol, setCurrencySymbol] = useState(company.currencySymbol);
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState(company.fiscalYearStartMonth);
  const [invoicePrefix, setInvoicePrefix] = useState(company.invoicePrefix);
  const [billPrefix, setBillPrefix] = useState(company.billPrefix);
  const [address, setAddress] = useState(company.address);
  const [email, setEmail] = useState(company.email);
  const [phone, setPhone] = useState(company.phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany({
      legalName,
      tradeName,
      pan: pan.toUpperCase(),
      gstin: gstin.toUpperCase(),
      currencyCode,
      currencySymbol,
      fiscalYearStartMonth: Number(fiscalYearStartMonth),
      invoicePrefix,
      billPrefix,
      address,
      email,
      phone,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-4 h-4" /> Multi-Tenant Legal Entity Configuration
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Company Setup & Financial Settings</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure legal identity, tax registrations (GSTIN/PAN), fiscal year cadence, currency symbols, and sequential numbering.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 text-xs">
        {/* Section 1: Legal Identity */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" /> 1. Organization Legal Identity
          </h3>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Company Legal Name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Trade Name / Brand (DBA)</label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Tax Identifiers */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 2. Tax Identification (GSTIN & PAN)
          </h3>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">GSTIN (15 characters)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono uppercase"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Used for calculating CGST/SGST vs IGST.</span>
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Permanent Account Number (PAN)</label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Currency & Fiscal Calendar */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" /> 3. Currency & Fiscal Year
          </h3>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Primary Currency Code</label>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Fiscal Year Start Month</label>
              <select
                value={fiscalYearStartMonth}
                onChange={(e) => setFiscalYearStartMonth(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              >
                <option value="4">April (India standard Apr-Mar)</option>
                <option value="1">January (Calendar Year Jan-Dec)</option>
                <option value="7">July (Jul-Jun)</option>
                <option value="10">October (Oct-Sep)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Numbering Sequences */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> 4. Transaction Numbering Series
          </h3>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Sales Invoice Prefix</label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Next Invoice: {invoicePrefix}{company.nextInvoiceNumber}</span>
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Purchase Bill Prefix</label>
              <input
                type="text"
                value={billPrefix}
                onChange={(e) => setBillPrefix(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Next Bill: {billPrefix}{company.nextBillNumber}</span>
            </div>
          </div>
        </div>

        {/* Section 5: Registered Office */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2">
            5. Contact & Registered Address
          </h3>

          <div className="mt-4 space-y-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Registered Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Official Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Official Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" /> Save Financial Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
