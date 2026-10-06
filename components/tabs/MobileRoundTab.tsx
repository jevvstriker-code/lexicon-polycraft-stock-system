/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/types/inventory';

interface MobileRoundTabProps {
  products: Product[];
  verifications: Record<string, boolean>;
  onVerifyItem: (product: Product, unitCount: number) => Promise<void>;
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onResetRound: () => void;
}

export const MobileRoundTab: React.FC<MobileRoundTabProps> = ({
  products,
  verifications,
  onVerifyItem,
  onOpenAddModal,
  onOpenEditModal,
  onResetRound,
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Local state for temporary round inputs per product
  const [counts, setCounts] = useState<Record<string, number>>({});

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginated = filteredProducts.slice(startIdx, startIdx + pageSize);

  const verifiedCount = useMemo(() => {
    return products.filter((p) => verifications[p.id]).length;
  }, [products, verifications]);

  const getItemCount = (p: Product) => {
    if (counts[p.id] !== undefined) return counts[p.id];
    const packSize = p.packaging_type === 'loose' ? 1 : p.pack_size || 1;
    return p.packaging_type !== 'loose' ? Math.round(p.stock / packSize) : p.stock;
  };

  const handleCountChange = (productId: string, val: number) => {
    setCounts((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="bg-gradient-to-r from-zinc-900 to-black text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-zinc-800 text-amber-400 px-2.5 py-1 rounded-md w-max mb-1 border border-zinc-700">
            <i className="fa-solid fa-mobile-screen-button" /> Mobile Floor Mode (304 SKUs with Sets Ready)
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Physical Stock Round & On-Site Add</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Optimized for mobile. Walk aisles, verify Sets, Bundles or Loose counts, or instantly add brand new products.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenAddModal}
            className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 text-black font-bold rounded-xl text-xs shadow hover:bg-amber-400 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-plus" /> + Add New Product
          </button>
          <button
            onClick={onResetRound}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-xs transition border border-zinc-700"
            title="Reset Verification Marks"
          >
            <i className="fa-solid fa-rotate-right" />
          </button>
        </div>
      </div>

      {/* Search and Filter for Round */}
      <div className="bg-zinc-900 p-3.5 sm:p-4 rounded-xl shadow-sm border border-zinc-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="w-full sm:w-96">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <i className="fa-solid fa-search" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search product name or code..."
              className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs sm:text-sm text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="text-xs font-medium text-zinc-300 flex items-center gap-2">
          <span className="bg-zinc-800 text-amber-400 border border-zinc-700 px-2.5 py-1 rounded-lg font-bold">
            {verifiedCount} / {products.length} Verified
          </span>
        </div>
      </div>

      {/* Mobile Round Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
            <p className="text-zinc-400 text-sm">No products found matching your search.</p>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-lg shadow hover:bg-amber-400 transition"
            >
              <i className="fa-solid fa-plus mr-1" /> Add New Product Now
            </button>
          </div>
        ) : (
          paginated.map((p) => {
            const isVerified = Boolean(verifications[p.id]);
            const pkgType = p.packaging_type || 'bundle';
            const packSize = pkgType === 'loose' ? 1 : p.pack_size || 1;
            const currentUnits = getItemCount(p);

            let unitLabel = 'Bdl';
            if (pkgType === 'set') unitLabel = 'Sets';
            else if (pkgType === 'inner') unitLabel = 'Inner';
            else if (pkgType === 'loose') unitLabel = 'Pcs';

            const pkgDisplay =
              pkgType === 'set'
                ? `Set (${packSize}p)`
                : pkgType === 'bundle'
                ? `Bundle (${packSize}p)`
                : pkgType === 'inner'
                ? `Inner (${packSize}p)`
                : 'Loose Pcs';

            const totalPcs = pkgType !== 'loose' ? currentUnits * packSize : currentUnits;

            return (
              <div
                key={p.id}
                className={`bg-zinc-900 rounded-2xl shadow-sm border ${
                  isVerified ? 'border-emerald-700 ring-2 ring-emerald-950' : 'border-zinc-800'
                } p-4 sm:p-5 flex flex-col justify-between space-y-4 transition`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.photo || 'https://placehold.co/100x100/18181b/fbbf24?text=Item'}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-zinc-700 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm leading-tight">{p.name}</h4>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          {p.code} • <span className="text-amber-400 font-semibold">{p.category}</span>
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.fsn === 'Runner'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {p.fsn}
                    </span>
                  </div>

                  <div className="bg-black p-3 rounded-xl border border-zinc-800 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                        System Stock
                      </span>
                      <span className="font-bold text-white text-sm">{p.stock} pcs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                        Packaging
                      </span>
                      <span className="font-bold text-amber-400 text-xs">{pkgDisplay}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                        Min / Max
                      </span>
                      <span className="font-medium text-zinc-300 text-xs">
                        {p.min_stock} / {p.max_stock}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Round Input Area */}
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-400 uppercase">
                      Count ({unitLabel}):
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={currentUnits}
                        onChange={(e) => handleCountChange(p.id, parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-1.5 bg-black border border-zinc-800 text-white rounded-lg text-center font-bold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <span className="text-xs text-zinc-400">{unitLabel}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-400 px-1">
                    <span>
                      Total Pcs: <strong className="text-emerald-400">{totalPcs} pcs</strong>
                    </span>
                    <span className={isVerified ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                      <i className={`fa-solid ${isVerified ? 'fa-circle-check' : 'fa-clock'} mr-1`} />
                      {isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onVerifyItem(p, currentUnits)}
                      className={`py-2.5 ${
                        isVerified
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-black'
                      } font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1`}
                    >
                      <i className="fa-solid fa-clipboard-check" /> {isVerified ? 'Re-Verify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => onOpenEditModal(p)}
                      className="py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1 border border-zinc-700"
                    >
                      <i className="fa-solid fa-pen" /> Edit SKU
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
        <span className="text-zinc-400 font-medium">
          Showing {filteredProducts.length > 0 ? startIdx + 1 : 0} to{' '}
          {Math.min(startIdx + pageSize, filteredProducts.length)} of {filteredProducts.length} items
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 bg-black border border-zinc-800 rounded-lg hover:bg-zinc-800 font-semibold text-white disabled:opacity-40 transition"
          >
            &larr; Prev
          </button>
          <span className="px-3 py-1 font-bold text-white">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 bg-black border border-zinc-800 rounded-lg hover:bg-zinc-800 font-semibold text-white disabled:opacity-40 transition"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
