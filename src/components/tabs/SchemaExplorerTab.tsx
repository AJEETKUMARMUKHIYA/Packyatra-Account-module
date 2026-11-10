import React, { useState } from 'react';
import { 
  Database, 
  Table2, 
  KeyRound, 
  Link2, 
  Copy, 
  Check, 
  Code2, 
  ShieldCheck, 
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { SCHEMA_TABLES, SQL_SERVER_DDL_SCRIPT } from '../../data/schemaData';
import { TableDefinition } from '../../types';

export const SchemaExplorerTab: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<TableDefinition>(SCHEMA_TABLES[0]);
  const [copiedDdl, setCopiedDdl] = useState(false);
  const [viewMode, setViewMode] = useState<'tables' | 'ddl'>('tables');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopyDdl = () => {
    navigator.clipboard.writeText(SQL_SERVER_DDL_SCRIPT);
    setCopiedDdl(true);
    setTimeout(() => setCopiedDdl(false), 2000);
  };

  const filteredTables = SCHEMA_TABLES.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Database className="w-4 h-4" /> Relational Architecture & Normalization
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">SQL Server Database Schema</h2>
          <p className="text-xs text-slate-400 mt-1">
            Normalized 3NF relational design with DECIMAL(18,2) precision, composite indexes, and check constraints.
          </p>
        </div>

        {/* View toggle & Copy DDL */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex text-xs font-medium">
            <button
              onClick={() => setViewMode('tables')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'tables' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" /> Interactive Tables
            </button>
            <button
              onClick={() => setViewMode('ddl')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'ddl' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Complete SQL Script
            </button>
          </div>

          <button
            onClick={handleCopyDdl}
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
          >
            {copiedDdl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedDdl ? 'Copied SQL Script!' : 'Copy SQL DDL'}
          </button>
        </div>
      </div>

      {viewMode === 'tables' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Table List (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 space-y-1 max-h-[600px] overflow-y-auto">
              {filteredTables.map((table) => {
                const isSelected = selectedTable.name === table.name;
                return (
                  <button
                    key={table.name}
                    onClick={() => setSelectedTable(table)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span>{table.name}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {table.columns.length} cols
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Detail View (Right 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-mono">{selectedTable.name}</h3>
                    <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
                      {selectedTable.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedTable.description}</p>
                </div>
              </div>

              {/* Columns Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Column</th>
                      <th className="py-2.5 px-3">Data Type</th>
                      <th className="py-2.5 px-3">Null</th>
                      <th className="py-2.5 px-3">Key / Constraint</th>
                      <th className="py-2.5 px-3">Business Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {selectedTable.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                          {col.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-cyan-400 text-[11px]">
                          {col.type}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {col.nullable ? 'NULL' : <span className="text-amber-400 font-semibold">NOT NULL</span>}
                        </td>
                        <td className="py-2.5 px-3">
                          {col.isPk && (
                            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              <KeyRound className="w-3 h-3" /> PK
                            </span>
                          )}
                          {col.isFk && (
                            <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded text-[10px] font-semibold" title={col.fkRef}>
                              <Link2 className="w-3 h-3" /> FK
                            </span>
                          )}
                          {!col.isPk && !col.isFk && <span className="text-slate-600">—</span>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {col.notes || (col.fkRef ? `Ref: ${col.fkRef}` : '—')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Indexes & Business Rules */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="bg-slate-800/50 p-3.5 rounded-lg border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" /> Indexes & Uniqueness
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300 font-mono text-[11px]">
                    {selectedTable.indexes.map((idx, i) => (
                      <li key={i} className="text-indigo-300/90">• {idx}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-800/50 p-3.5 rounded-lg border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Business Rules & Invariance
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300 text-[11px]">
                    {selectedTable.businessRules.map((rule, i) => (
                      <li key={i} className="text-slate-300 flex items-start gap-1.5">
                        <span className="text-emerald-400">✓</span> {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full DDL Script Viewer */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-slate-800 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-300">schema_definition.sql (Microsoft SQL Server 2022)</span>
            <button
              onClick={handleCopyDdl}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              {copiedDdl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedDdl ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto bg-slate-950 max-h-[650px] leading-relaxed">
            {SQL_SERVER_DDL_SCRIPT}
          </pre>
        </div>
      )}
    </div>
  );
};
