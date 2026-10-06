'use client';

import React, { useState } from 'react';
import { Product, ProductFormData, PackagingType, FSNType } from '@/types/inventory';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (data: ProductFormData, isEditing: boolean, id?: string) => Promise<void>;
}

interface ProductFormInnerProps {
  product: Product | null;
  onClose: () => void;
  onSave: (data: ProductFormData, isEditing: boolean, id?: string) => Promise<void>;
}

const ProductFormInner: React.FC<ProductFormInnerProps> = ({ product, onClose, onSave }) => {
  const isEditing = Boolean(product && product.id);

  const [code, setCode] = useState<string>(product?.code || 'LP-SKU-NEW');
  const [name, setName] = useState<string>(product?.name || '');
  const [category, setCategory] = useState<string>(product?.category || 'Containers');
  const [fsn, setFsn] = useState<FSNType>(product?.fsn || 'Runner');
  const [packagingType, setPackagingType] = useState<PackagingType>(product?.packaging_type || 'set');
  const [packSize, setPackSize] = useState<number>(product?.pack_size || 3);
  const [minStock, setMinStock] = useState<number>(product?.min_stock ?? 50);
  const [maxStock, setMaxStock] = useState<number>(product?.max_stock ?? 500);
  const [stock, setStock] = useState<number>(product?.stock ?? 100);
  const [photo, setPhoto] = useState<string>(product?.photo || '');
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setErrorMsg('Please fill in Product Code and Name.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      await onSave(
        {
          code,
          name,
          category,
          fsn,
          packaging_type: packagingType,
          pack_size: packagingType === 'loose' ? 1 : Number(packSize) || 1,
          min_stock: Number(minStock) || 0,
          max_stock: Number(maxStock) || 0,
          stock: Number(stock) || 0,
          photo,
        },
        isEditing,
        product?.id
      );
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const getBundleLabel = () => {
    if (packagingType === 'set') return 'Pieces per Set (e.g. 3 PCS SET)';
    if (packagingType === 'bundle') return 'Pieces per Bundle';
    if (packagingType === 'inner') return 'Pieces per Inner Box';
    return 'Pieces per Unit';
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-zinc-800 text-white px-6 py-4 flex justify-between items-center border-b border-zinc-700">
        <h3 className="font-bold text-sm sm:text-base">
          {isEditing ? `Edit Product: ${product?.code}` : 'Add New Plastic Product / Set'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-white text-lg focus:outline-none"
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-300 px-3 py-2 rounded-lg text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              Product Code / SKU *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. LP-ORCH-SET3"
              className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              Category / Mold Type
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
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
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. ORCHID CONTAINER SET (350/600/1000)"
            className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              FSN Classification
            </label>
            <select
              value={fsn}
              onChange={(e) => setFsn(e.target.value as FSNType)}
              className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="Runner">Runner (Fast Turnover)</option>
              <option value="Repeater">Repeater (Medium Turnover)</option>
              <option value="Stranger">Stranger (Slow Turnover)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              Packaging Format
            </label>
            <select
              value={packagingType}
              onChange={(e) => setPackagingType(e.target.value as PackagingType)}
              className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="set">Set / Inner Box (Multi-piece)</option>
              <option value="bundle">Standard Bundle Packaging</option>
              <option value="inner">Inner Packaging</option>
              <option value="loose">Loose Pieces Only</option>
            </select>
          </div>
        </div>

        {packagingType !== 'loose' && (
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              {getBundleLabel()}
            </label>
            <input
              type="number"
              min={1}
              value={packSize}
              onChange={(e) => setPackSize(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              Min Level
            </label>
            <input
              type="number"
              min={0}
              value={minStock}
              onChange={(e) => setMinStock(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              Max Level
            </label>
            <input
              type="number"
              min={0}
              value={maxStock}
              onChange={(e) => setMaxStock(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
              Initial Stock Qty
            </label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">
            Product Photo URL (Optional)
          </label>
          <input
            type="text"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="https://placehold.co/100x100"
            className="w-full px-3 py-2 bg-black border border-zinc-800 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-zinc-800 px-6 py-3 border-t border-zinc-700 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs sm:text-sm font-medium rounded-lg transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs sm:text-sm font-bold rounded-lg shadow-sm transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-zinc-800">
        <ProductFormInner
          key={product?.id || 'new-product-modal'}
          product={product}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
};
