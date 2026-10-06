'use client';

import React from 'react';
import { Product, ActivityLog } from '@/types/inventory';
import { TabType } from '@/components/ui/Header';

interface DashboardTabProps {
  products: Product[];
  logs: ActivityLog[];
  onSwitchTab: (tab: TabType) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ products, logs, onSwitchTab }) => {
  const totalSkus = products.length;
  let lowStock = 0;
  let overStock = 0;
  let runnerCount = 0;
  let repeaterCount = 0;
  let strangerCount = 0;

  let runnerQty = 0;
  let repeaterQty = 0;
  let strangerQty = 0;

  products.forEach((p) => {
    if (p.stock < p.min_stock) lowStock++;
    if (p.stock > p.max_stock) overStock++;

    if (p.fsn === 'Runner') {
      runnerCount++;
      runnerQty += Number(p.stock);
    } else if (p.fsn === 'Repeater') {
      repeaterCount++;
      repeaterQty += Number(p.stock);
    } else if (p.fsn === 'Stranger') {
      strangerCount++;
      strangerQty += Number(p.stock);
    }
  });

  const totalQty = runnerQty + repeaterQty + strangerQty || 1;
  const runnerPercent = Math.round((runnerQty / totalQty) * 100);
  const repeaterPercent = Math.round((repeaterQty / totalQty) * 100);
  const strangerPercent = Math.round((strangerQty / totalQty) * 100);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-zinc-900 p-3.5 sm:p-4 rounded-xl shadow-sm border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total SKUs</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">{totalSkus}</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-zinc-800 text-amber-400 rounded-xl">
            <i className="fa-solid fa-boxes-stacked text-lg sm:text-xl" />
          </div>
        </div>
        <div className="bg-zinc-900 p-3.5 sm:p-4 rounded-xl shadow-sm border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Low Stock</p>
            <h3 className="text-xl sm:text-2xl font-bold text-amber-500 mt-1">{lowStock}</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-zinc-800 text-amber-500 rounded-xl">
            <i className="fa-solid fa-triangle-exclamation text-lg sm:text-xl" />
          </div>
        </div>
        <div className="bg-zinc-900 p-3.5 sm:p-4 rounded-xl shadow-sm border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Overstock</p>
            <h3 className="text-xl sm:text-2xl font-bold text-rose-500 mt-1">{overStock}</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-zinc-800 text-rose-500 rounded-xl">
            <i className="fa-solid fa-circle-exclamation text-lg sm:text-xl" />
          </div>
        </div>
        <div className="bg-zinc-900 p-3.5 sm:p-4 rounded-xl shadow-sm border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Runner (Fast)</p>
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-500 mt-1">{runnerCount}</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-zinc-800 text-emerald-500 rounded-xl">
            <i className="fa-solid fa-bolt text-lg sm:text-xl" />
          </div>
        </div>
        <div className="col-span-2 lg:col-span-1 bg-zinc-900 p-3.5 sm:p-4 rounded-xl shadow-sm border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Repeater / Stranger</p>
            <h3 className="text-xl sm:text-2xl font-bold text-purple-400 mt-1">
              {repeaterCount} / {strangerCount}
            </h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-zinc-800 text-purple-400 rounded-xl">
            <i className="fa-solid fa-rotate text-lg sm:text-xl" />
          </div>
        </div>
      </div>

      {/* Dashboard Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stock Health & FSN Breakdown */}
        <div className="bg-zinc-900 p-4 sm:p-5 rounded-xl shadow-sm border border-zinc-800 lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-amber-400" /> Stock Health & FSN Breakdown (304 SKUs with Sets)
            </h2>
            <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded hidden sm:inline-block">
              Lexicon Polycraft
            </span>
          </div>
          <div className="space-y-4 my-auto">
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1 font-medium">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle text-[10px]" /> Runner Items (High Turnover)
                </span>
                <span>{runnerQty} pcs</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${runnerPercent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1 font-medium">
                <span className="text-blue-400 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle text-[10px]" /> Repeater Items (Regular)
                </span>
                <span>{repeaterQty} pcs</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${repeaterPercent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1 font-medium">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle text-[10px]" /> Stranger Items (Slow/Dead Stock)
                </span>
                <span>{strangerQty} pcs</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-zinc-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${strangerPercent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-zinc-400">
            <span>Tip: Set and inner packaging configurations loaded. Use Mobile Round mode for floor audits.</span>
            <button
              onClick={() => onSwitchTab('mobile-round')}
              className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
            >
              Start Mobile Round &rarr;
            </button>
          </div>
        </div>

        {/* Quick Action Card */}
        <div className="bg-zinc-900 border border-zinc-800 text-white p-5 sm:p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center text-amber-400 text-xl mb-4">
              <i className="fa-solid fa-mobile-screen-button" />
            </div>
            <h2 className="text-lg font-bold mb-2">Mobile Round Ready</h2>
            <p className="text-zinc-400 text-xs sm:text-sm mb-6">
              Conduct quick stock audits on mobile, update sets, bundles or loose pieces, or add new items on the shop floor.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => onSwitchTab('mobile-round')}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition shadow flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-walking" /> Start Physical Stock Round
            </button>
            <button
              onClick={() => onSwitchTab('counting')}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 border border-zinc-700"
            >
              <i className="fa-solid fa-calculator" /> Production / Dispatch Entry
            </button>
          </div>
        </div>
      </div>

      {/* Recent Stock Movements / Activity Logs */}
      <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-4 sm:p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-amber-400" /> Recent Stock Adjustments & Rounds
          </h2>
          <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full font-medium border border-zinc-700">
            {logs.length} Logs
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-800 text-zinc-300 uppercase text-[11px]">
              <tr>
                <th className="p-2.5 rounded-l-lg">Timestamp</th>
                <th className="p-2.5">Product Name / SKU</th>
                <th className="p-2.5">Action Type</th>
                <th className="p-2.5">Qty Changed</th>
                <th className="p-2.5">New Stock</th>
                <th className="p-2.5 rounded-r-lg">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-zinc-500">
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                logs.slice(0, 10).map((l) => (
                  <tr key={l.id} className="hover:bg-zinc-800">
                    <td className="p-2.5 text-zinc-400 text-[11px]">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="p-2.5 font-semibold text-white">
                      {l.code} - {l.name}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          l.type === 'production'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : l.type === 'delivery'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}
                      >
                        {l.type.toUpperCase()}
                      </span>
                    </td>
                    <td
                      className={`p-2.5 font-bold ${
                        l.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {l.change >= 0 ? `+${l.change}` : l.change} pcs
                    </td>
                    <td className="p-2.5 font-semibold text-white">{l.new_stock} pcs</td>
                    <td className="p-2.5 text-zinc-300 text-[11px]">{l.remarks || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
