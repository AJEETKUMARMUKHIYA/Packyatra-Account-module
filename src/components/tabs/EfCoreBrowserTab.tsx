import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode2, Layers, Cpu } from 'lucide-react';
import { EF_CORE_FILES, CSharpFileItem } from '../../data/efCoreData';

export const EfCoreBrowserTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CSharpFileItem>(EF_CORE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Code2 className="w-4 h-4" /> Domain Models & Entity Framework Core 9
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">C# Entity Classes & DbContext</h2>
          <p className="text-xs text-slate-400 mt-1">
            Strongly typed domain models, enums, Fluent API configurations, and custom balance validation logic.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied C# Source!' : `Copy ${selectedFile.name}`}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Navigator (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Domain & Infrastructure Source Files
          </div>
          <div className="space-y-1.5">
            {EF_CORE_FILES.map((file) => {
              const isSelected = selectedFile.id === file.id;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold flex items-center gap-2">
                      <FileCode2 className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      {file.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        file.layer === 'Domain'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {file.layer}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 line-clamp-1">{file.summary}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white">{selectedFile.name}</span>
              <span className="text-[11px] text-slate-400">({selectedFile.project})</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">C# 13 / .NET 9</div>
          </div>

          <div className="p-3 bg-slate-800/30 border-b border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-indigo-300">Architecture Purpose: </span>
            {selectedFile.summary}
          </div>

          <div className="p-4 bg-slate-950 overflow-x-auto max-h-[580px] font-mono text-xs leading-relaxed text-slate-300">
            <pre>{selectedFile.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
