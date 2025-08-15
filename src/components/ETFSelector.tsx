import React, { useState } from 'react';
import { AlphaVantageService, ETFData } from '../services/alphaVantageService';

interface ETFSelectorProps {
  onETFsSelected: (etfs: ETFData[]) => void;
  selectedETFs: ETFData[];
}

export const ETFSelector: React.FC<ETFSelectorProps> = ({ onETFsSelected, selectedETFs }) => {
  const [selectedCategory, setSelectedCategory] = useState<'factor' | 'sector'>('factor');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const factorETFs = AlphaVantageService.getETFsByCategory('factor');
  const sectorETFs = AlphaVantageService.getETFsByCategory('sector');

  // Get unique subcategories for the selected category
  const getSubcategories = (category: 'factor' | 'sector'): string[] => {
    const etfs = category === 'factor' ? factorETFs : sectorETFs;
    const subcategories = Array.from(new Set(etfs.map(etf => etf.subcategory)));
    return ['all', ...subcategories.sort()];
  };

  // Filter ETFs based on selection
  const getFilteredETFs = (): ETFData[] => {
    let filtered = selectedCategory === 'factor' ? factorETFs : sectorETFs;
    
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(etf => etf.subcategory === selectedSubcategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(etf => 
        etf.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etf.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleETFSelection = (etf: ETFData) => {
    const isSelected = selectedETFs.some(selected => selected.symbol === etf.symbol);
    
    if (isSelected) {
      onETFsSelected(selectedETFs.filter(selected => selected.symbol !== etf.symbol));
    } else {
      onETFsSelected([...selectedETFs, etf]);
    }
  };

  const isETFSelected = (etf: ETFData): boolean => {
    return selectedETFs.some(selected => selected.symbol === etf.symbol);
  };

  const clearSelection = () => {
    onETFsSelected([]);
  };

  const selectAllVisible = () => {
    const filtered = getFilteredETFs();
    const newSelection = [...selectedETFs];
    
    filtered.forEach(etf => {
      if (!isETFSelected(etf)) {
        newSelection.push(etf);
      }
    });
    
    onETFsSelected(newSelection);
  };

  return (
    <div className="card bg-slate-700 border-slate-600 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">ETF Selection</h3>
        <div className="flex space-x-2">
          <button
            onClick={clearSelection}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={selectAllVisible}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Select All Visible
          </button>
        </div>
      </div>

      {/* Category Selection */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setSelectedCategory('factor')}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedCategory === 'factor'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
          }`}
        >
          Factor ETFs ({factorETFs.length})
        </button>
        <button
          onClick={() => setSelectedCategory('sector')}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedCategory === 'sector'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
          }`}
        >
          Sector ETFs ({sectorETFs.length})
        </button>
      </div>

      {/* Subcategory Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Subcategory Filter:
        </label>
        <select
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {getSubcategories(selectedCategory).map(subcategory => (
            <option key={subcategory} value={subcategory}>
              {subcategory === 'all' ? 'All Subcategories' : subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Search ETFs:
        </label>
        <input
          type="text"
          placeholder="Search by symbol or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ETF List */}
      <div className="max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {getFilteredETFs().map((etf) => (
            <div
              key={etf.symbol}
              onClick={() => handleETFSelection(etf)}
              className={`p-3 rounded-md border cursor-pointer transition-all hover:scale-105 ${
                isETFSelected(etf)
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-600 border-slate-500 text-slate-200 hover:bg-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{etf.symbol}</div>
                  <div className="text-sm opacity-80">{etf.name}</div>
                  <div className="text-xs opacity-60 capitalize">{etf.subcategory}</div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  isETFSelected(etf)
                    ? 'bg-white border-white'
                    : 'border-slate-400'
                }`}>
                  {isETFSelected(etf) && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full m-0.5"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedETFs.length > 0 && (
        <div className="mt-4 p-3 bg-slate-600 rounded-md">
          <div className="text-sm text-slate-300 mb-2">
            Selected ETFs ({selectedETFs.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedETFs.map((etf) => (
              <span
                key={etf.symbol}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md"
              >
                {etf.symbol}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
