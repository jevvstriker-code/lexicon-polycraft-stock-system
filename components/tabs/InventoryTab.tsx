/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/types/inventory';

interface InventoryTabProps {
  products: Product[];
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onDeleteProduct: (id: string, code: string) => void;
  onExportExcel: () => void;
  onImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetCatalog: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  products,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProduct,
  onExportExcel,
  onImportExcel,
  onResetCatalog,
}) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFsn, setFilterFsn] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchCat = !filterCategory || p.category === filterCategory;
      const matchFsn = !filterFsn || p.fsn === filterFsn;

      let status = 'normal';
      if (p.stock < p.min_stock) status = 'low';
      else if (p.stock > p.max_stock) status = 'over';
      const matchStatus = !filterStatus || status === filterStatus;

      return matchSearch && matchCat && matchFsn && matchStatus;
    });
  }, [products, search, filterCategory, filterFsn, filterStatus]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginated = filteredProducts.slice(startIdx, startIdx + pageSize);

  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="bg-zinc-900 p-4 sm:p-5 rounded-xl shadow-sm border border-zinc-800 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Inventory Master Catalog (304 SKUs with Sets & Inners)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage plastic products, set/inner configurations, bundle sizes, min/max thresholds, and FSN classifications.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenAddModal}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            <i className="fa-solid fa-plus" /> Add Product
          </button>
          <label className="flex-1 sm:flex-none px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 border border-zinc-700">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={onImportExcel}
            />
            <i className="fa-solid fa-file-excel text-emerald-400" /> Import
          </label>
          <button
            onClick={onExportExcel}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg text-xs sm:text-sm transition flex items-center gap-2 border border-zinc-700"
            title="Export to Excel"
          >
            <i className="fa-solid fa-file-arrow-down text-blue-400" /> Export
          </button>
          <button
            onClick={onResetCatalog}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-rose-400 rounded-lg text-sm transition border border-zinc-700"
            title="Reset Default 304 Items"
          >
            <i className="fa-solid fa-rotate-right" />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-zinc-900 p-3.5 sm:p-4 rounded-xl shadow-sm border border-zinc-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <i className="fa-solid fa-search text-xs" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
              placeholder="Search product name, code..."
              className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              handleFilterChange();
            }}
            className="flex-1 sm:flex-none px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Categories</option>
            <option value="Containers">Containers</option>
            <option value="Buckets">Buckets</option>
            <option value="Baths & Tubs">Baths & Tubs</option>
            <option value="Stools & Patlas">Stools & Patlas</option>
            <option value="Mugs & Dishware">Mugs & Dishware</option>
            <option value="Ghamelas">Ghamelas</option>
            <option value="Pedal Bins & Dustbins">Pedal Bins & Dustbins</option>
            <option value="Drums & Racks">Drums & Racks</option>
            <option value="Baskets & Trays">Baskets & Trays</option>
            <option value="Bowls & Basins">Bowls & Basins</option>
          </select>
          <select
            value={filterFsn}
            onChange={(e) => {
              setFilterFsn(e.target.value);
              handleFilterChange();
            }}
            className="flex-1 sm:flex-none px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All FSN</option>
            <option value="Runner">Runner</option>
            <option value="Repeater">Repeater</option>
            <option value="Stranger">Stranger</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              handleFilterChange();
            }}
            className="flex-1 sm:flex-none px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="normal">Normal</option>
            <option value="over">Overstock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-800 text-zinc-300 uppercase text-[11px] font-semibold">
              <tr>
                <th className="p-3">Photo</th>
                <th className="p-3">Product Name & Code</th>
                <th className="p-3">Category</th>
                <th className="p-3">FSN</th>
                <th className="p-3 text-center">Packaging / Set Type</th>
                <th className="p-3 text-center">Min / Max</th>
                <th className="p-3 text-center">Stock Qty</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-zinc-500">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Normal
                    </span>
                  );
                  if (p.stock < p.min_stock) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1 w-max">
                        <i className="fa-solid fa-triangle-exclamation" /> Low
                      </span>
                    );
                  } else if (p.stock > p.max_stock) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1 w-max">
                        <i className="fa-solid fa-circle-exclamation" /> Over
                      </span>
                    );
                  }

                  const fsnColor =
                    p.fsn === 'Runner'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : p.fsn === 'Repeater'
                      ? 'bg-blue-950 text-blue-400 border-blue-800'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700';

                  let pkgStr = 'Loose Pcs';
                  if (p.packaging_type === 'set') pkgStr = `Set (${p.pack_size} Pcs/Set)`;
                  else if (p.packaging_type === 'bundle') pkgStr = `Bundle (${p.pack_size} Pcs/Bdl)`;
                  else if (p.packaging_type === 'inner') pkgStr = `Inner (${p.pack_size} Pcs/Inner)`;

                  return (
                    <tr key={p.id} className="hover:bg-zinc-800 transition">
                      <td className="p-3">
                        <img
                          src={p.photo || 'https://placehold.co/100x100/18181b/fbbf24?text=Item'}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover border border-zinc-700"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{p.code}</div>
                      </td>
                      <td className="p-3 text-zinc-300">{p.category}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${fsnColor}`}>
                          {p.fsn}
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold text-amber-400 text-xs">{pkgStr}</td>
                      <td className="p-3 text-center text-xs font-medium text-zinc-300">
                        {p.min_stock} / {p.max_stock}
                      </td>
                      <td className="p-3 text-center font-bold text-white">{p.stock} pcs</td>
                      <td className="p-3">{statusBadge}</td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => onOpenEditModal(p)}
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs border border-zinc-700 transition"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id, p.code)}
                          className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-lg text-xs border border-rose-800 transition"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs">
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
    </div>
  );
};
