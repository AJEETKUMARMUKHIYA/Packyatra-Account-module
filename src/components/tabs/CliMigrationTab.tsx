import React, { useState } from 'react';
import { Terminal, Copy, Check, Package, FileCode, Play, Database } from 'lucide-react';
import { CLI_COMMANDS, NUGET_PACKAGES } from '../../data/requirementsData';

export const CliMigrationTab: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Terminal className="w-4 h-4" /> CLI Scaffolding & EF Core Migrations
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">.NET Project Setup & Database Migrations</h2>
          <p className="text-xs text-slate-400 mt-1">
            Exact .NET 9 CLI commands for generating the Clean Architecture solution, adding dependencies, and executing initial migrations.
          </p>
        </div>
      </div>

      {/* CLI Script Steps */}
      <div className="space-y-4">
        {CLI_COMMANDS.map((step, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-700/80 flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-200 flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-indigo-400" />
                {step.step}
              </span>
              <button
                onClick={() => handleCopy(step.command, idx)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                {copiedIndex === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedIndex === idx ? 'Copied Commands!' : 'Copy Script'}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300 bg-slate-950 overflow-x-auto leading-relaxed">
              {step.command}
            </pre>
          </div>
        ))}
      </div>

      {/* NuGet Packages Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" /> Required NuGet Packages & Compatible Versions (.NET 9)
          </h3>
          <span className="text-[11px] text-slate-500">{NUGET_PACKAGES.length} packages specified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Package Name</th>
                <th className="py-2.5 px-3">Target Project</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Architectural Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {NUGET_PACKAGES.map((pkg) => (
                <tr key={pkg.name} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                    {pkg.name}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-cyan-400 text-[11px]">
                    StartupAccounting.{pkg.project}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-300 text-[11px]">
                    {pkg.version}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {pkg.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
