'use client';

import React, { useState } from 'react';

export type TabType = 'dashboard' | 'inventory' | 'counting' | 'mobile-round' | 'reports';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, onOpenSync }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: TabType) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const getTabClass = (tab: TabType) => {
    const isActive = activeTab === tab;
    if (tab === 'mobile-round') {
      return isActive
        ? 'px-3 py-2 rounded-lg text-amber-300 bg-zinc-800 border border-amber-500/50 text-xs sm:text-sm font-semibold transition flex items-center gap-2 w-full sm:w-auto shadow-inner'
        : 'px-3 py-2 rounded-lg text-amber-400 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs sm:text-sm font-medium transition flex items-center gap-2 w-full sm:w-auto';
    }

    return isActive
      ? 'px-3 py-2 rounded-lg bg-zinc-800 text-white text-xs sm:text-sm font-medium transition hover:bg-zinc-700 flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-center border border-zinc-700'
      : 'px-3 py-2 rounded-lg text-zinc-300 text-xs sm:text-sm font-medium transition hover:bg-zinc-900 flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-center border border-transparent';
  };

  return (
    <header className="bg-black border-b border-zinc-800 text-white shadow-md no-print shrink-0 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl shadow-inner text-amber-400 font-bold text-xl flex items-center justify-center w-10 h-10">
              <i className="fa-solid fa-boxes-stacked" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Lexicon Polycraft</h1>
              <p className="text-[11px] text-zinc-400">Official 304 SKU Catalog with Sets & Inner Packaging</p>
            </div>
          </div>
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden text-zinc-400 hover:text-white p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`} />
          </button>
        </div>

        {/* Navigation Bar (Desktop & Collapsible Mobile) */}
        <div
          className={`${
            mobileMenuOpen ? 'flex flex-col' : 'hidden'
          } sm:flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-center pb-2 sm:pb-0`}
        >
          <button onClick={() => handleTabClick('dashboard')} className={getTabClass('dashboard')}>
            <i className="fa-solid fa-chart-pie w-5 text-amber-400" /> Dashboard
          </button>
          <button onClick={() => handleTabClick('inventory')} className={getTabClass('inventory')}>
            <i className="fa-solid fa-warehouse w-5 text-amber-400" /> Inventory Master
          </button>
          <button onClick={() => handleTabClick('counting')} className={getTabClass('counting')}>
            <i className="fa-solid fa-clipboard-check w-5 text-amber-400" /> Stock Adjustment
          </button>
          {/* Dedicated Mobile Round Walkthrough Tab */}
          <button onClick={() => handleTabClick('mobile-round')} className={getTabClass('mobile-round')}>
            <i className="fa-solid fa-mobile-screen-button w-5" /> 📱 Mobile Stock Round
          </button>
          <button onClick={() => handleTabClick('reports')} className={getTabClass('reports')}>
            <i className="fa-solid fa-print w-5 text-amber-400" /> A4 Print
          </button>
          <button
            onClick={() => {
              onOpenSync();
              setMobileMenuOpen(false);
            }}
            className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-emerald-400 text-xs sm:text-sm font-medium transition hover:bg-zinc-800 flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-center shadow-sm"
          >
            <i className="fa-brands fa-google-drive w-5" /> Sheets Sync
          </button>
        </div>
      </div>
    </header>
  );
};
