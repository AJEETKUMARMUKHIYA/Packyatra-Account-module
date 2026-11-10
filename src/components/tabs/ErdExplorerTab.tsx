import React, { useState } from 'react';
import { 
  Network, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Database, 
  Link2, 
  Search,
  Filter,
  Info,
  GitBranch
} from 'lucide-react';
import { ENTITY_RELATIONSHIPS } from '../../data/erdData';
import { SCHEMA_TABLES } from '../../data/schemaData';

export const ErdExplorerTab: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('JournalEntries');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRelationships = ENTITY_RELATIONSHIPS.filter((rel) => {
    const matchesSearch = 
      rel.sourceTable.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rel.targetTable.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rel.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'cascade') return rel.onDelete === 'Cascade';
    if (filterType === 'restrict') return rel.onDelete === 'Restrict';
    if (filterType === '1to1') return rel.cardinality === '1:1';
    if (filterType === '1toN') return rel.cardinality === '1:N';
    return true;
  });

  const tableRelationsOutgoing = ENTITY_RELATIONSHIPS.filter((r) => r.sourceTable === selectedTable);
  const tableRelationsIncoming = ENTITY_RELATIONSHIPS.filter((r) => r.targetTable === selectedTable);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Network className="w-4 h-4" /> Entity Relationship Model & Relational Integrity
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Entity Relationships & Cardinality (ERD)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual foreign key graph, multi-table cardinalities (1:N, 1:1), and cascade delete protection policies.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({ENTITY_RELATIONSHIPS.length})
            </button>
            <button
              onClick={() => setFilterType('restrict')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === 'restrict' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Restrict ({ENTITY_RELATIONSHIPS.filter(r => r.onDelete === 'Restrict').length})
            </button>
            <button
              onClick={() => setFilterType('cascade')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === 'cascade' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cascade ({ENTITY_RELATIONSHIPS.filter(r => r.onDelete === 'Cascade').length})
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Table Inspector on Left, Relationships Grid on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Selector & Focus Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Select Entity to Inspect</span>
              <Database className="w-3.5 h-3.5 text-indigo-400" />
            </div>

            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
              {SCHEMA_TABLES.map((table) => {
                const isSelected = selectedTable === table.name;
                const outCount = ENTITY_RELATIONSHIPS.filter(r => r.sourceTable === table.name).length;
                const inCount = ENTITY_RELATIONSHIPS.filter(r => r.targetTable === table.name).length;

                return (
                  <button
                    key={table.name}
                    onClick={() => setSelectedTable(table.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span>{table.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {outCount} out • {inCount} in
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Focus Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                {selectedTable} Cardinality Map
              </h3>
            </div>

            {/* Outgoing relationships */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Outgoing Foreign Keys ({tableRelationsOutgoing.length})
              </div>
              {tableRelationsOutgoing.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No outgoing parent references.</div>
              ) : (
                <div className="space-y-1.5">
                  {tableRelationsOutgoing.map((rel) => (
                    <div key={rel.id} className="p-2 bg-slate-800/60 rounded-lg text-xs flex items-center justify-between">
                      <span className="text-slate-200 font-mono">{rel.sourceTable} <ArrowRight className="inline w-3 h-3 text-indigo-400 mx-1" /> {rel.targetTable}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {rel.cardinality}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incoming relationships */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Incoming Foreign Keys ({tableRelationsIncoming.length})
              </div>
              {tableRelationsIncoming.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No child tables reference this entity.</div>
              ) : (
                <div className="space-y-1.5">
                  {tableRelationsIncoming.map((rel) => (
                    <div key={rel.id} className="p-2 bg-slate-800/60 rounded-lg text-xs flex items-center justify-between">
                      <span className="text-slate-200 font-mono">{rel.sourceTable} <ArrowRight className="inline w-3 h-3 text-emerald-400 mx-1" /> {rel.targetTable}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {rel.cardinality}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Relationships List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter relationships by table name or rule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3.5" />
          </div>

          <div className="space-y-3">
            {filteredRelationships.map((rel) => (
              <div
                key={rel.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-md space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
                    <span className="text-indigo-400">{rel.sourceTable}.{rel.sourceColumn}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-emerald-400">{rel.targetTable}.{rel.targetColumn}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {rel.cardinality}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rel.onDelete === 'Restrict'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      ON DELETE {rel.onDelete.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {rel.description}
                </p>
              </div>
            ))}
          </div>

          {/* Delete Policy Explanation Callout */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-400" /> Critical Cascade Delete Policies
            </h4>
            <p>
              <strong>1. Restrict (No Action):</strong> Applied to all master entities (Company, Account, Customer, Vendor) 
              and transactional parents (SalesInvoices $\leftrightarrow$ JournalEntries). Prevents orphaned financial records and ensures historical audit compliance.
            </p>
            <p>
              <strong>2. Cascade:</strong> Strictly limited to compositional aggregate child records (e.g. <code>SalesInvoices $\to$ SalesInvoiceLines</code>, 
              <code>JournalEntries $\to$ JournalEntryLines</code>, and <code>Payments $\to$ PaymentAllocations</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
