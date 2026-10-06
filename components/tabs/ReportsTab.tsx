'use client';

import React from 'react';
import { Product } from '@/types/inventory';

interface ReportsTabProps {
  products: Product[];
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ products }) => {
  let runnerCount = 0;
  let lowCount = 0;
  let overCount = 0;

  products.forEach((p) => {
    if (p.fsn === 'Runner') runnerCount++;
    if (p.stock < p.min_stock) lowCount++;
    if (p.stock > p.max_stock) overCount++;
  });

  const reportDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="bg-zinc-900 p-4 sm:p-5 rounded-xl shadow-sm border border-zinc-800 flex flex-wrap justify-between items-center gap-4 no-print">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            A4 Stock Audit & Verification Report
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Formatted for clean A4 printing, official sign-offs, and set/bundle audits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs sm:text-sm transition shadow-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-print" /> Print A4 Report
          </button>
        </div>
      </div>

      {/* A4 Printable Document Container */}
      <div className="bg-white text-slate-900 shadow-lg border border-slate-300 rounded-xl p-4 sm:p-8 max-w-4xl mx-auto print-container space-y-5">
        {/* Company Header */}
        <div className="border-b border-slate-300 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              LEXICON POLYCRAFT
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Plastic Products Manufacturing & Stock Verification Unit (304 SKUs with Sets)
            </p>
            <p className="text-xs text-slate-600 mt-2">
              <span className="font-semibold">Report Date:</span> <span>{reportDate}</span>
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg inline-block">
              <p className="text-xs font-bold text-slate-900 uppercase">
                Stock Audit & Set Packaging Sheet
              </p>
            </div>
            <p className="text-xs text-slate-600 mt-2">Verified by: _______________</p>
          </div>
        </div>

        {/* Report Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100 p-3.5 rounded-lg border border-slate-300 text-center">
          <div>
            <p className="text-[11px] text-slate-600 uppercase font-semibold">Total SKUs</p>
            <p className="text-base sm:text-lg font-bold text-slate-900">{products.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-600 uppercase font-semibold">Runner Items</p>
            <p className="text-base sm:text-lg font-bold text-emerald-700">{runnerCount}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-600 uppercase font-semibold">Low Stock Items</p>
            <p className="text-base sm:text-lg font-bold text-amber-700">{lowCount}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-600 uppercase font-semibold">Overstock Items</p>
            <p className="text-base sm:text-lg font-bold text-rose-700">{overCount}</p>
          </div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] sm:text-xs border-collapse border border-slate-300">
            <thead className="bg-slate-200 text-slate-900 font-bold uppercase">
              <tr>
                <th className="border border-slate-300 p-2">Code</th>
                <th className="border border-slate-300 p-2">Product Name</th>
                <th className="border border-slate-300 p-2">Category</th>
                <th className="border border-slate-300 p-2">FSN</th>
                <th className="border border-slate-300 p-2 text-center">Set / Packaging</th>
                <th className="border border-slate-300 p-2 text-center">Min / Max</th>
                <th className="border border-slate-300 p-2 text-center">Current Stock</th>
                <th className="border border-slate-300 p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                let statusText = 'Normal';
                let statusColor = 'text-emerald-700';
                if (p.stock < p.min_stock) {
                  statusText = 'Low Stock';
                  statusColor = 'text-amber-700 font-bold';
                } else if (p.stock > p.max_stock) {
                  statusText = 'Overstock';
                  statusColor = 'text-rose-700 font-bold';
                }

                const pkgType = p.packaging_type || 'bundle';
                const packSize = pkgType === 'loose' ? 1 : p.pack_size || 1;
                const units = Math.round(p.stock / packSize);
                const pkgStr =
                  pkgType === 'set'
                    ? `${packSize} Pcs/Set (${units} sets)`
                    : pkgType === 'bundle'
                    ? `${packSize} Pcs/Bdl (${units} bdl)`
                    : pkgType === 'inner'
                    ? `${packSize} Pcs/Inner (${units} inr)`
                    : 'Loose Pcs';

                return (
                  <tr key={p.id}>
                    <td className="border border-slate-300 p-2 font-mono font-bold">{p.code}</td>
                    <td className="border border-slate-300 p-2 font-semibold">{p.name}</td>
                    <td className="border border-slate-300 p-2">{p.category}</td>
                    <td className="border border-slate-300 p-2">{p.fsn}</td>
                    <td className="border border-slate-300 p-2 text-center text-[11px]">{pkgStr}</td>
                    <td className="border border-slate-300 p-2 text-center">
                      {p.min_stock} / {p.max_stock}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-xs">
                      {p.stock} pcs
                    </td>
                    <td className={`border border-slate-300 p-2 ${statusColor}`}>{statusText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs text-slate-700">
          <div className="border-t border-slate-400 pt-2">Store Keeper Signature</div>
          <div className="border-t border-slate-400 pt-2">Production Manager Signature</div>
          <div className="border-t border-slate-400 pt-2">Authorized Signatory / Plant Head</div>
        </div>
      </div>
    </div>
  );
};
