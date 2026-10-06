'use client';

import React, { useState, useMemo } from 'react';
import { Product, TransactionType, StockAdjustmentData } from '@/types/inventory';

interface StockAdjustmentTabProps {
  products: Product[];
  onAdjustStock: (data: StockAdjustmentData) => Promise<void>;
  onVerifyCountingItem: (product: Product, unitCount: number) => Promise<void>;
}

export const StockAdjustmentTab: React.FC<StockAdjustmentTabProps> = ({
  products,
  onAdjustStock,
  onVerifyCountingItem,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [adjType, setAdjType] = useState<TransactionType>('production');
  const [adjMode, setAdjMode] = useState<'sets' | 'pieces'>('sets');
  const [adjQty, setAdjQty] = useState<number>(0);
  const [adjRemarks, setAdjRemarks] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Table state
  const [searchTable, setSearchTable] = useState<string>('');
  const [tablePage, setTablePage] = useState<number>(1);
  const tablePageSize = 25;
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const selectedPkgType = selectedProduct?.packaging_type || 'bundle';
  const selectedPackSize = selectedPkgType === 'loose' ? 1 : selectedProduct?.pack_size || 1;

  const calculatedTotalPreview = useMemo(() => {
    if (!selectedProduct) return 0;
    if (selectedPkgType !== 'loose' && adjMode === 'sets') {
      return adjQty * selectedPackSize;
    }
    return adjQty;
  }, [selectedProduct, selectedPkgType, selectedPackSize, adjMode, adjQty]);

  const filteredCountingProducts = useMemo(() => {
    const q = searchTable.toLowerCase().trim();
    return products.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    );
  }, [products, searchTable]);

  const totalPages = Math.ceil(filteredCountingProducts.length / tablePageSize) || 1;
  const currentPage = Math.min(Math.max(1, tablePage), totalPages);
  const startIdx = (currentPage - 1) * tablePageSize;
  const paginatedTable = filteredCountingProducts.slice(startIdx, startIdx + tablePageSize);

  const getTableCount = (p: Product) => {
    if (tableCounts[p.id] !== undefined) return tableCounts[p.id];
    const packSize = p.packaging_type === 'loose' ? 1 : p.pack_size || 1;
    return p.packaging_type !== 'loose' ? Math.round(p.stock / packSize) : p.stock;
  };

  const handleTableCountChange = (productId: string, val: number) => {
    setTableCounts((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      await onAdjustStock({
        productId: selectedProduct.id,
        type: adjType,
        qtyInput: Number(adjQty) || 0,
        mode: adjMode,
        remarks: adjRemarks.trim(),
      });
      setAdjQty(0);
      setAdjRemarks('');
    } finally {
      setSubmitting(false);
    }
  };

  const getPkgDesc = (p?: Product) => {
    if (!p) return 'Loose Only';
    if (p.packaging_type === 'set') return `Set (${p.pack_size} Pcs/Set)`;
    if (p.packaging_type === 'bundle') return `Bundle (${p.pack_size} Pcs/Bdl)`;
    if (p.packaging_type === 'inner') return `Inner Box (${p.pack_size} Pcs/Inner)`;
    return 'Loose Only';
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="bg-zinc-900 p-4 sm:p-5 rounded-xl shadow-sm border border-zinc-800 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Stock Counting & Set/Bundle Adjustments
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Log quantities after <strong>Production</strong> (Stock In) or <strong>Delivery</strong> (Stock Out) using Sets, Bundles or Loose Pieces.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-zinc-800 text-amber-400 font-semibold px-3 py-1.5 rounded-lg border border-zinc-700">
            <i className="fa-solid fa-layer-group mr-1" /> Sets, Bundles & Loose Mode
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Action Form Card */}
        <form
          onSubmit={handleAdjustSubmit}
          className="bg-zinc-900 p-4 sm:p-5 rounded-xl shadow-sm border border-zinc-800 lg:col-span-1 space-y-4"
        >
          <h3 className="font-bold text-white text-sm sm:text-base pb-2 border-b border-zinc-800 flex items-center gap-2">
            <i className="fa-solid fa-calculator text-amber-400" /> Stock Adjustment Entry
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              Select Product SKU
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} (Stock: {p.stock} pcs)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-black p-3 rounded-lg border border-zinc-800 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-zinc-500">Current Stock:</span>
              <span className="font-bold text-white">{selectedProduct?.stock ?? 0} pcs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Packaging / Set Info:</span>
              <span className="font-bold text-amber-400">{getPkgDesc(selectedProduct)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Min / Max Level:</span>
              <span className="font-medium text-zinc-300">
                {selectedProduct?.min_stock ?? 0} / {selectedProduct?.max_stock ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">FSN Category:</span>
              <span className="font-medium text-amber-400">{selectedProduct?.fsn ?? '-'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              Transaction Type
            </label>
            <select
              value={adjType}
              onChange={(e) => setAdjType(e.target.value as TransactionType)}
              className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="production">➕ After Production (Stock In)</option>
              <option value="delivery">➖ After Delivery / Dispatch (Stock Out)</option>
              <option value="physical_audit">📋 Physical Count Audit (Set Exact)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Count By</label>
              <select
                value={selectedPkgType === 'loose' ? 'pieces' : adjMode}
                disabled={selectedPkgType === 'loose'}
                onChange={(e) => setAdjMode(e.target.value as 'sets' | 'pieces')}
                className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50"
              >
                <option value="sets">
                  {selectedPkgType === 'set'
                    ? 'Sets Count'
                    : selectedPkgType === 'inner'
                    ? 'Inner Box Count'
                    : 'Bundles Count'}
                </option>
                <option value="pieces">Loose Pieces</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
                {adjMode === 'sets' && selectedPkgType !== 'loose'
                  ? selectedPkgType === 'set'
                    ? 'Number of Sets'
                    : 'Number of Bundles'
                  : 'Number of Loose Pieces'}
              </label>
              <input
                type="number"
                min="0"
                value={adjQty}
                onChange={(e) => setAdjQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-zinc-800 text-amber-300 px-3 py-2.5 rounded-lg text-xs font-semibold flex justify-between items-center border border-zinc-700">
            <span>Calculated Total Qty:</span>
            <span className="text-sm font-bold">{calculatedTotalPreview} Pcs</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              Remarks / Challan / Batch No.
            </label>
            <input
              type="text"
              value={adjRemarks}
              onChange={(e) => setAdjRemarks(e.target.value)}
              placeholder="e.g. Shift A production / Dispatch"
              className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <i className="fa-solid fa-check" /> {submitting ? 'Updating...' : 'Update Stock Now'}
          </button>
        </form>

        {/* Live Counting Table with Set/Bundle Support */}
        <div className="bg-zinc-900 p-4 sm:p-5 rounded-xl shadow-sm border border-zinc-800 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <i className="fa-solid fa-list-check text-amber-400" /> Stock Sheet (Sets & Bundles)
            </h3>
            <input
              type="text"
              value={searchTable}
              onChange={(e) => {
                setSearchTable(e.target.value);
                setTablePage(1);
              }}
              placeholder="Filter items..."
              className="px-3 py-1.5 bg-black border border-zinc-800 text-white rounded-lg text-xs w-40 sm:w-48 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-800 text-zinc-300 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="p-3">Code / Product</th>
                  <th className="p-3 text-center">Packaging / Set Info</th>
                  <th className="p-3 text-center">System Stock</th>
                  <th className="p-3 text-center">Count (Set/Bdl / Pcs)</th>
                  <th className="p-3 text-center">Total Pcs</th>
                  <th className="p-3 text-right">Verify</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {paginatedTable.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-zinc-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  paginatedTable.map((p) => {
                    const pkgType = p.packaging_type || 'bundle';
                    const packSize = pkgType === 'loose' ? 1 : p.pack_size || 1;
                    const estimatedVal = getTableCount(p);

                    let unitLabel = 'Bdl';
                    if (pkgType === 'set') unitLabel = 'Set';
                    else if (pkgType === 'inner') unitLabel = 'Inner';
                    else if (pkgType === 'loose') unitLabel = 'Pcs';

                    const pkgInfo =
                      pkgType === 'set'
                        ? `${packSize} Pcs/Set`
                        : pkgType === 'bundle'
                        ? `${packSize} Pcs/Bdl`
                        : pkgType === 'inner'
                        ? `${packSize} Pcs/Inner`
                        : 'Loose Only';

                    const totalPcs = pkgType !== 'loose' ? estimatedVal * packSize : estimatedVal;

                    return (
                      <tr key={p.id} className="hover:bg-zinc-800">
                        <td className="p-3">
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{p.code}</div>
                        </td>
                        <td className="p-3 text-center font-semibold text-amber-400 text-xs">{pkgInfo}</td>
                        <td className="p-3 text-center font-bold text-zinc-300">{p.stock} pcs</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={estimatedVal}
                              onChange={(e) =>
                                handleTableCountChange(p.id, parseInt(e.target.value) || 0)
                              }
                              className="w-16 px-2 py-1 bg-black border border-zinc-800 text-white rounded text-center text-xs sm:text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                            <span className="text-[11px] text-zinc-400 font-medium">{unitLabel}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-400">{totalPcs} pcs</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onVerifyCountingItem(p, estimatedVal)}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-bold shadow-sm transition"
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Counting Pagination */}
          <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs mt-3">
            <span className="text-zinc-400 font-medium">
              Showing {filteredCountingProducts.length > 0 ? startIdx + 1 : 0} to{' '}
              {Math.min(startIdx + tablePageSize, filteredCountingProducts.length)} of{' '}
              {filteredCountingProducts.length} items
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 bg-black border border-zinc-800 rounded-lg hover:bg-zinc-800 font-semibold text-white disabled:opacity-40 transition"
              >
                &larr; Prev
              </button>
              <span className="px-3 py-1 font-bold text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setTablePage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 bg-black border border-zinc-800 rounded-lg hover:bg-zinc-800 font-semibold text-white disabled:opacity-40 transition"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
