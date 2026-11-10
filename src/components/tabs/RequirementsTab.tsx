import React, { useState } from 'react';
import { 
  ListChecks, 
  ShieldAlert, 
  Filter, 
  CheckCircle2, 
  ArrowUpRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { FUNCTIONAL_REQUIREMENTS, NON_FUNCTIONAL_REQUIREMENTS, RequirementItem } from '../../data/requirementsData';

export const RequirementsTab: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'functional' | 'non-functional'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterItems = (items: RequirementItem[]) => {
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredFunctional = filterItems(FUNCTIONAL_REQUIREMENTS);
  const filteredNonFunctional = filterItems(NON_FUNCTIONAL_REQUIREMENTS);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <ListChecks className="w-4 h-4" /> Requirements Baseline & Acceptance Criteria
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">System Requirements Matrix</h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete list of functional objectives and non-functional guarantees for production accounting.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({FUNCTIONAL_REQUIREMENTS.length + NON_FUNCTIONAL_REQUIREMENTS.length})
            </button>
            <button
              onClick={() => setFilterType('functional')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === 'functional' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Functional ({FUNCTIONAL_REQUIREMENTS.length})
            </button>
            <button
              onClick={() => setFilterType('non-functional')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === 'non-functional' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Non-Functional ({NON_FUNCTIONAL_REQUIREMENTS.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search requirements by ID, title, keyword (e.g. GST, Decimal, Journal, RBAC)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Functional Requirements Section */}
      {(filterType === 'all' || filterType === 'functional') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Functional Requirements ({filteredFunctional.length})
            </h3>
            <span className="text-xs text-slate-500">Business features, transactional workflows & reporting</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredFunctional.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {req.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {req.phase}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          req.priority === 'Critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-xs mt-2.5">{req.title}</h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{req.category}</div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{req.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-Functional Requirements Section */}
      {(filterType === 'all' || filterType === 'non-functional') && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Non-Functional Requirements ({filteredNonFunctional.length})
            </h3>
            <span className="text-xs text-slate-500">Security, accuracy, concurrency, and performance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredNonFunctional.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900/90 border border-slate-800/90 hover:border-purple-500/30 rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {req.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {req.phase}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {req.priority}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-xs mt-2.5">{req.title}</h4>
                  <div className="text-[11px] text-purple-400 font-mono mt-0.5">{req.category}</div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{req.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
