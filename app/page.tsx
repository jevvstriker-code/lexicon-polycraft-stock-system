'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Product, ActivityLog, ProductFormData, StockAdjustmentData, FSNType, PackagingType } from '@/types/inventory';
import { InventoryController } from '@/controllers/inventoryController';
import { Header, TabType } from '@/components/ui/Header';
import { Toast, ToastState } from '@/components/ui/Toast';
import { ProductModal } from '@/components/forms/ProductModal';
import { SyncModal } from '@/components/common/SyncModal';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { InventoryTab } from '@/components/tabs/InventoryTab';
import { MobileRoundTab } from '@/components/tabs/MobileRoundTab';
import { StockAdjustmentTab } from '@/components/tabs/StockAdjustmentTab';
import { ReportsTab } from '@/components/tabs/ReportsTab';

export default function Home() {
  const controller = useMemo(() => new InventoryController(), []);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [verifications, setVerifications] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState<boolean>(false);

  // Toast
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    isError: false,
  });

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  }, []);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      const data = await controller.loadInitialData();
      setProducts(data.products);
      setLogs(data.logs);
      setVerifications(data.verifications);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to database';
      showToast(msg, true);
    } finally {
      setLoading(false);
    }
  }, [controller, showToast]);

  useEffect(() => {
    let isMounted = true;
    controller.loadInitialData()
      .then((data) => {
        if (isMounted) {
          setProducts(data.products);
          setLogs(data.logs);
          setVerifications(data.verifications);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setLoading(false);
          const msg = err instanceof Error ? err.message : 'Failed to connect to database';
          showToast(msg, true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [controller, showToast]);

  // Handle Save Product (Create or Update)
  const handleSaveProduct = async (formData: ProductFormData, isEditing: boolean, id?: string) => {
    const saved = await controller.handleSaveProduct(formData, isEditing, id);
    if (isEditing) {
      setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      showToast(`Updated SKU ${saved.code} successfully.`);
    } else {
      setProducts((prev) => [saved, ...prev]);
      showToast(`Created new product ${saved.code} successfully.`);
    }
    // Refresh logs in background
    controller.loadInitialData().then((d) => setLogs(d.logs)).catch(() => {});
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete SKU: ${code}?`)) return;
    try {
      await controller.handleDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Deleted SKU ${code} from database.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      showToast(msg, true);
    }
  };

  // Handle Stock Adjustment
  const handleAdjustStock = async (adjData: StockAdjustmentData) => {
    try {
      const updated = await controller.handleStockAdjustment(adjData);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast(`Stock updated for ${updated.code}. New stock: ${updated.stock} pcs`);
      // Update logs
      const d = await controller.loadInitialData();
      setLogs(d.logs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to adjust stock';
      showToast(msg, true);
    }
  };

  // Handle Mobile Round Verification
  const handleVerifyRoundItem = async (product: Product, unitCount: number) => {
    try {
      const res = await controller.handleVerifyRoundItem(product, unitCount);
      setProducts((prev) => prev.map((p) => (p.id === res.product.id ? res.product : p)));
      setVerifications((prev) => ({ ...prev, [product.id]: true }));
      showToast(`Verified ${product.code}: Stock updated to ${res.product.stock} pcs`);
      // Update logs
      controller.loadInitialData().then((d) => setLogs(d.logs)).catch(() => {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      showToast(msg, true);
    }
  };

  // Handle Reset Round Marks
  const handleResetRound = async () => {
    if (!confirm('Clear all mobile round verification marks?')) return;
    try {
      await controller.handleResetRound();
      setVerifications({});
      showToast('Mobile round progress reset.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset round';
      showToast(msg, true);
    }
  };

  // Handle Reset Catalog to 304 default items in Supabase
  const handleResetCatalog = async () => {
    if (!confirm('Reset catalog to official 304 Lexicon Polycraft products with sets and inner packaging in database?')) {
      return;
    }
    try {
      setLoading(true);
      const reseeded = await controller.handleResetCatalog();
      setProducts(reseeded);
      showToast(`Reset database to official ${reseeded.length} SKUs successfully.`);
      const d = await controller.loadInitialData();
      setLogs(d.logs);
      setVerifications(d.verifications);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset catalog';
      showToast(msg, true);
    } finally {
      setLoading(false);
    }
  };

  // Handle Export Excel
  const handleExportExcel = () => {
    const worksheetData = products.map((p) => ({
      'Product Code': p.code,
      'Product Name': p.name,
      Category: p.category,
      'FSN Type': p.fsn,
      'Packaging Type': p.packaging_type,
      'Pack / Set Size': p.pack_size,
      'Min Level': p.min_stock,
      'Max Level': p.max_stock,
      'Current Stock': p.stock,
      'Photo URL': p.photo || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lexicon Inventory Sets');
    XLSX.writeFile(workbook, 'Lexicon_Polycraft_304_SKUs_Sets_Stock.xlsx');
    showToast('Inventory with sets exported to Excel successfully.');
  };

  // Handle Import Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        interface RawRow {
          'Product Code'?: string;
          code?: string;
          'Product Name'?: string;
          name?: string;
          Category?: string;
          category?: string;
          'FSN Type'?: string;
          fsn?: string;
          'Packaging Type'?: string;
          packaging_type?: string;
          'Pack / Set Size'?: number | string;
          pack_size?: number | string;
          'Min Level'?: number | string;
          min_stock?: number | string;
          'Max Level'?: number | string;
          max_stock?: number | string;
          'Current Stock'?: number | string;
          stock?: number | string;
          'Photo URL'?: string;
          photo?: string;
        }

        const json = XLSX.utils.sheet_to_json<RawRow>(worksheet);

        if (json.length === 0) {
          showToast('The uploaded Excel file is empty.', true);
          return;
        }

        setLoading(true);
        const parsedProducts: Array<Omit<Product, 'id' | 'created_at' | 'updated_at'>> = json.map(
          (row) => ({
            code: String(row['Product Code'] || row.code || 'LP-NEW').trim().toUpperCase(),
            name: String(row['Product Name'] || row.name || 'Unnamed Product').trim(),
            category: String(row.Category || row.category || 'Containers').trim(),
            fsn: (row['FSN Type'] || row.fsn || 'Repeater') as FSNType,
            packaging_type: (row['Packaging Type'] || row.packaging_type || 'bundle') as PackagingType,
            pack_size: parseInt(String(row['Pack / Set Size'] || row.pack_size || 3)) || 1,
            min_stock: parseInt(String(row['Min Level'] || row.min_stock || 50)) || 0,
            max_stock: parseInt(String(row['Max Level'] || row.max_stock || 500)) || 0,
            stock: parseInt(String(row['Current Stock'] || row.stock || 100)) || 0,
            photo: String(row['Photo URL'] || row.photo || '').trim(),
          })
        );

        const count = await controller.handleBulkImport(parsedProducts);
        showToast(`Successfully imported and synced ${count} products into Supabase.`);
        await loadData();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error parsing Excel file';
        showToast(msg, true);
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col antialiased">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSync={() => setSyncModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 overflow-y-auto">
        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-zinc-400">
              Connecting to Supabase & Loading 304 SKU Catalog...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardTab
                products={products}
                logs={logs}
                onSwitchTab={setActiveTab}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryTab
                products={products}
                onOpenAddModal={() => {
                  setEditingProduct(null);
                  setProductModalOpen(true);
                }}
                onOpenEditModal={(prod) => {
                  setEditingProduct(prod);
                  setProductModalOpen(true);
                }}
                onDeleteProduct={handleDeleteProduct}
                onExportExcel={handleExportExcel}
                onImportExcel={handleImportExcel}
                onResetCatalog={handleResetCatalog}
              />
            )}

            {activeTab === 'mobile-round' && (
              <MobileRoundTab
                products={products}
                verifications={verifications}
                onVerifyItem={handleVerifyRoundItem}
                onOpenAddModal={() => {
                  setEditingProduct(null);
                  setProductModalOpen(true);
                }}
                onOpenEditModal={(prod) => {
                  setEditingProduct(prod);
                  setProductModalOpen(true);
                }}
                onResetRound={handleResetRound}
              />
            )}

            {activeTab === 'counting' && (
              <StockAdjustmentTab
                products={products}
                onAdjustStock={handleAdjustStock}
                onVerifyCountingItem={handleVerifyRoundItem}
              />
            )}

            {activeTab === 'reports' && <ReportsTab products={products} />}
          </>
        )}
      </main>

      {/* Product Modal */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Sync Modal */}
      <SyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        products={products}
        onExportExcel={handleExportExcel}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
}
