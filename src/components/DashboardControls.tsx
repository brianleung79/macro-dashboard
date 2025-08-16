import React from 'react';
import { MacroVariable, DashboardConfig, ChartTimeframe } from '../types';
import { BarChart3, TrendingUp, Divide, Activity } from 'lucide-react';

interface DashboardControlsProps {
  config: DashboardConfig;
  onConfigChange: (config: DashboardConfig) => void;
  availableVariables: MacroVariable[];
}

export const DashboardControls: React.FC<DashboardControlsProps> = ({
  config,
  onConfigChange,
  availableVariables
}) => {
  const updateChart1 = (updates: Partial<DashboardConfig['chart1']>) => {
    onConfigChange({
      ...config,
      chart1: { ...config.chart1, ...updates }
    });
  };

  const updateChart2 = (updates: Partial<DashboardConfig['chart2']>) => {
    onConfigChange({
      ...config,
      chart2: { ...config.chart2, ...updates }
    });
  };

  const updateChart3 = (updates: Partial<DashboardConfig['chart3']>) => {
    onConfigChange({
      ...config,
      chart3: { ...config.chart3, ...updates }
    });
  };

  const updateChart4 = (updates: Partial<DashboardConfig['chart4']>) => {
    onConfigChange({
      ...config,
      chart4: { ...config.chart4, ...updates }
    });
  };

  const updateChart5 = (updates: Partial<DashboardConfig['chart5']>) => {
    onConfigChange({
      ...config,
      chart5: { ...config.chart5, ...updates }
    });
  };

  const updateTimeframe = (chartKey: keyof DashboardConfig, updates: Partial<ChartTimeframe>) => {
    onConfigChange({
      ...config,
      [chartKey]: { ...config[chartKey], timeframe: { ...config[chartKey].timeframe, ...updates } }
    });
  };

  const addVariableToChart1 = (variable: MacroVariable) => {
    if (config.chart1.variables.length < 10 && !config.chart1.variables.find(v => v.fredTicker === variable.fredTicker)) {
      updateChart1({ variables: [...config.chart1.variables, variable] });
    }
  };

  const removeVariableFromChart1 = (fredTicker: string) => {
    updateChart1({ variables: config.chart1.variables.filter(v => v.fredTicker !== fredTicker) });
  };

  const addPairToChart4 = (var1: MacroVariable, var2: MacroVariable) => {
    if (config.chart4.variablePairs.length < 5) {
      updateChart4({ variablePairs: [...config.chart4.variablePairs, { var1, var2 }] });
    }
  };

  const removePairFromChart4 = (index: number) => {
    updateChart4({ variablePairs: config.chart4.variablePairs.filter((_, i) => i !== index) });
  };

  const addVariableToChart5 = (variable: MacroVariable) => {
    if (config.chart5.variables.length < 4 && !config.chart5.variables.find(v => v.fredTicker === variable.fredTicker)) {
      updateChart5({ variables: [...config.chart5.variables, variable] });
    }
  };

  const removeVariableFromChart5 = (fredTicker: string) => {
    updateChart5({ variables: config.chart5.variables.filter(v => v.fredTicker !== fredTicker) });
  };

  // Group variables by type for better organization
  const groupedVariables = availableVariables.reduce((groups, variable) => {
    let category = 'Economic Activity'; // Default to Economic Activity instead of Other
    
    // Check if this is an ETF first (has category/subcategory)
    if (variable.category === 'factor' || variable.category === 'sector') {
      category = 'Equity Factors';
    } else if (variable.series.toLowerCase().includes('pce') || variable.series.toLowerCase().includes('cpi') || variable.series.toLowerCase().includes('inflation') || variable.series.toLowerCase().includes('ppi')) {
      category = 'Inflation & Prices';
    } else if (variable.series.toLowerCase().includes('industrial production') || variable.series.toLowerCase().includes('leading index') || variable.series.toLowerCase().includes('gdp') || variable.series.toLowerCase().includes('production') || variable.series.toLowerCase().includes('index') || variable.series.toLowerCase().includes('consumption') || variable.series.toLowerCase().includes('retail') || variable.series.toLowerCase().includes('sales')) {
      category = 'Economic Activity';
    } else if (variable.series.toLowerCase().includes('high yield') || variable.series.toLowerCase().includes('oas') || variable.series.toLowerCase().includes('spread') || variable.fredTicker.includes('T10Y2Y') || variable.fredTicker.includes('BAML') || variable.series.toLowerCase().includes('corporate') || variable.series.toLowerCase().includes('stress')) {
      category = 'Credit & Risk Spreads';
    } else if (variable.series.toLowerCase().includes('crude') || variable.series.toLowerCase().includes('price') || variable.fredTicker.includes('PCOPP') || variable.fredTicker.includes('GOLD') || variable.series.toLowerCase().includes('oil') || variable.series.toLowerCase().includes('gas') || variable.series.toLowerCase().includes('copper') || variable.series.toLowerCase().includes('retail gasoline')) {
      category = 'Commodity Prices';
    } else if (variable.series.toLowerCase().includes('rate') || variable.series.toLowerCase().includes('yield') || variable.fredTicker.includes('DGS') || variable.series.toLowerCase().includes('fed funds') || variable.series.toLowerCase().includes('t-bill')) {
      category = 'Interest Rates & Yields';
    } else if (variable.series.toLowerCase().includes('exchange') || variable.fredTicker.includes('DEX') || variable.series.toLowerCase().includes('dollar') || variable.series.toLowerCase().includes('eur') || variable.series.toLowerCase().includes('jpy') || variable.series.toLowerCase().includes('gbp') || variable.series.toLowerCase().includes('broad us dollar')) {
      category = 'Exchange Rates';
    } else if (variable.series.toLowerCase().includes('mortgage') || variable.series.toLowerCase().includes('housing') || variable.series.toLowerCase().includes('building') || variable.series.toLowerCase().includes('case-shiller')) {
      category = 'Housing & Mortgages';
    } else if (variable.series.toLowerCase().includes('unemployment') || variable.series.toLowerCase().includes('employment') || variable.series.toLowerCase().includes('payroll') || variable.series.toLowerCase().includes('job')) {
      category = 'Employment & Labor';
    } else if (variable.series.toLowerCase().includes('sp') || variable.fredTicker.includes('SP') || variable.fredTicker.includes('NASDAQ') || variable.series.toLowerCase().includes('vix')) {
      // Move S&P 500 and Nasdaq to Equity Factors, keep VIX in Market Indices
      if (variable.series.toLowerCase().includes('sp') || variable.fredTicker.includes('SP') || variable.fredTicker.includes('NASDAQ')) {
        category = 'Equity Factors';
      } else {
        category = 'Market Indices';
      }
    }
    // If none of the above, it defaults to 'Economic Activity' instead of 'Other' - Updated
    
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(variable);
    return groups;
  }, {} as Record<string, MacroVariable[]>);

  // Sort categories for consistent display
  const categoryOrder = [
    'Equity Factors',
    'Market Indices',
    'Interest Rates & Yields',
    'Credit & Risk Spreads',
    'Inflation & Prices',
    'Commodity Prices',
    'Economic Activity',
    'Exchange Rates',
    'Housing & Mortgages',
    'Employment & Labor'
  ];

  const renderVariableOptions = () => {
    return categoryOrder.map(category => {
      if (groupedVariables[category] && groupedVariables[category].length > 0) {
        return (
          <optgroup key={category} label={category}>
            {groupedVariables[category].map((variable) => (
              <option key={variable.fredTicker} value={variable.fredTicker}>
                {variable.series}
              </option>
            ))}
          </optgroup>
        );
      }
      return null;
    });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Chart 1: Price Chart */}
      <div className="card bg-slate-800 border-slate-700 p-3 shadow-lg">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-blue-400" />
          Chart 1: Price Chart (up to 10 series)
        </h4>
        
        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Add Variable:</label>
          <select
            onChange={(e) => {
              const variable = availableVariables.find(v => v.fredTicker === e.target.value);
              if (variable) addVariableToChart1(variable);
            }}
            className="select-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
            value=""
          >
            <option value="">Select variable...</option>
            {renderVariableOptions()}
          </select>
        </div>

        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Selected Variables:</label>
          <div className="space-y-1">
            {config.chart1.variables.map((variable) => (
              <div key={variable.fredTicker} className="flex items-center justify-between bg-slate-700 px-2 py-1 rounded border border-slate-600">
                <span className="text-xs text-slate-200">{variable.series}</span>
                <button
                  onClick={() => removeVariableFromChart1(variable.fredTicker)}
                  className="text-red-400 hover:text-red-300 text-xs hover:bg-slate-600 px-1 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Start Date:</label>
            <input
              type="date"
              value={config.chart1.timeframe.startDate}
              onChange={(e) => updateTimeframe('chart1', { startDate: e.target.value })}
              className="input-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">End Date:</label>
            <input
              type="date"
              value={config.chart1.timeframe.endDate}
              onChange={(e) => updateTimeframe('chart1', { endDate: e.target.value })}
              className="input-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Chart 1 Quick Date Presets */}
        <div className="mt-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Quick Presets:</label>
          <div className="flex flex-wrap gap-1">
            {[
              { name: '1Y', start: '2023-01-01', end: '2024-01-01' },
              { name: '5Y', start: '2019-01-01', end: '2024-01-01' },
              { name: '10Y', start: '2014-01-01', end: '2024-01-01' },
              { name: '20Y', start: '2004-01-01', end: '2024-01-01' },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => updateTimeframe('chart1', { startDate: preset.start, endDate: preset.end })}
                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors border border-slate-600"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 2: Ratio/Spread */}
      <div className="card bg-slate-800 border-slate-700 p-3 shadow-lg">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
          <Divide size={16} className="text-emerald-400" />
          Chart 2: Ratio/Spread
        </h4>
        
        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Plot Type:</label>
          <select
            value={config.chart2.plotType}
            onChange={(e) => updateChart2({ plotType: e.target.value as 'ratio' | 'spread' })}
            className="select-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
          >
            <option value="ratio">Ratio</option>
            <option value="spread">Spread</option>
          </select>
        </div>

        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Variable 1:</label>
          <select
            value={config.chart2.variable1?.fredTicker || ''}
            onChange={(e) => {
              const variable = availableVariables.find(v => v.fredTicker === e.target.value);
              updateChart2({ variable1: variable });
            }}
            className="select-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
          >
            <option value="">Select variable...</option>
            {renderVariableOptions()}
          </select>
        </div>

        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Variable 2:</label>
          <select
            value={config.chart2.variable2?.fredTicker || ''}
            onChange={(e) => {
              const variable = availableVariables.find(v => v.fredTicker === e.target.value);
              updateChart2({ variable2: variable });
            }}
            className="select-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
          >
            <option value="">Select variable...</option>
            {renderVariableOptions()}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Start Date:</label>
            <input
              type="date"
              value={config.chart2.timeframe.startDate}
              onChange={(e) => updateTimeframe('chart2', { startDate: e.target.value })}
              className="input-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">End Date:</label>
            <input
              type="date"
              value={config.chart2.timeframe.endDate}
              onChange={(e) => updateTimeframe('chart2', { endDate: e.target.value })}
              className="input-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Chart 2 Quick Date Presets */}
        <div className="mt-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Quick Presets:</label>
          <div className="flex flex-wrap gap-1">
            {[
              { name: '1Y', start: '2023-01-01', end: '2024-01-01' },
              { name: '5Y', start: '2019-01-01', end: '2024-01-01' },
              { name: '10Y', start: '2014-01-01', end: '2024-01-01' },
              { name: '20Y', start: '2004-01-01', end: '2024-01-01' },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => updateTimeframe('chart2', { startDate: preset.start, endDate: preset.end })}
                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors border border-slate-600"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: Ratio/Spread */}
      <div className="card bg-slate-800 border-slate-700 p-3 shadow-lg">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
          <Divide size={16} className="text-emerald-400" />
          Chart 3: Ratio/Spread
        </h4>
        
        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Plot Type:</label>
          <select
            value={config.chart3.plotType}
            onChange={(e) => updateChart3({ plotType: e.target.value as 'ratio' | 'spread' })}
            className="select-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
          >
            <option value="ratio">Ratio</option>
            <option value="spread">Spread</option>
          </select>
        </div>

        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Variable 1:</label>
          <select
            value={config.chart3.variable1?.fredTicker || ''}
            onChange={(e) => {
              const variable = availableVariables.find(v => v.fredTicker === e.target.value);
              updateChart3({ variable1: variable });
            }}
            className="select-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
          >
            <option value="">Select variable...</option>
            {renderVariableOptions()}
          </select>
        </div>

        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Variable 2:</label>
          <select
            value={config.chart3.variable2?.fredTicker || ''}
            onChange={(e) => {
              const variable = availableVariables.find(v => v.fredTicker === e.target.value);
              updateChart3({ variable2: variable });
            }}
            className="select-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
          >
            <option value="">Select variable...</option>
            {renderVariableOptions()}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Start Date:</label>
            <input
              type="date"
              value={config.chart3.timeframe.startDate}
              onChange={(e) => updateTimeframe('chart3', { startDate: e.target.value })}
              className="input-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">End Date:</label>
            <input
              type="date"
              value={config.chart3.timeframe.endDate}
              onChange={(e) => updateTimeframe('chart3', { endDate: e.target.value })}
              className="input-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Chart 3 Quick Date Presets */}
        <div className="mt-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Quick Presets:</label>
          <div className="flex flex-wrap gap-1">
            {[
              { name: '1Y', start: '2023-01-01', end: '2024-01-01' },
              { name: '5Y', start: '2019-01-01', end: '2024-01-01' },
              { name: '10Y', start: '2014-01-01', end: '2024-01-01' },
              { name: '20Y', start: '2004-01-01', end: '2024-01-01' },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => updateTimeframe('chart3', { startDate: preset.start, endDate: preset.end })}
                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors border border-slate-600"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 4: Rolling Correlations */}
      <div className="card bg-slate-800 border-slate-700 p-3 shadow-lg">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
          <BarChart3 size={16} className="text-violet-400" />
          Chart 4: Rolling Correlations (up to 5 pairs)
        </h4>
        
        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Add Variable Pair:</label>
          <div className="grid grid-cols-2 gap-1 mb-1">
            <select
              onChange={(e) => {
                const variable = availableVariables.find(v => v.fredTicker === e.target.value);
                if (variable) {
                  // Store temporarily for pairing
                  (window as any).tempVar1 = variable;
                }
              }}
              className="select-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
              value=""
            >
              <option value="">Var 1...</option>
              {renderVariableOptions()}
            </select>
            <select
              onChange={(e) => {
                const variable = availableVariables.find(v => v.fredTicker === e.target.value);
                if (variable && (window as any).tempVar1) {
                  addPairToChart4((window as any).tempVar1, variable);
                  (window as any).tempVar1 = null;
                }
              }}
              className="select-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
              value=""
            >
              <option value="">Var 2...</option>
              {renderVariableOptions()}
            </select>
          </div>
        </div>

        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Selected Pairs:</label>
          <div className="space-y-1">
            {config.chart4.variablePairs.map((pair, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-700 px-2 py-1 rounded border border-slate-600">
                <span className="text-xs text-slate-200">{pair.var1.series} / {pair.var2.series}</span>
                <button
                  onClick={() => removePairFromChart4(index)}
                  className="text-red-400 hover:text-red-300 text-xs hover:bg-slate-600 px-1 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Start Date:</label>
            <input
              type="date"
              value={config.chart4.timeframe.startDate}
              onChange={(e) => updateTimeframe('chart4', { startDate: e.target.value })}
              className="input-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">End Date:</label>
            <input
              type="date"
              value={config.chart4.timeframe.endDate}
              onChange={(e) => updateTimeframe('chart4', { endDate: e.target.value })}
              className="input-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Chart 4 Quick Date Presets */}
        <div className="mt-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Quick Presets:</label>
          <div className="flex flex-wrap gap-1">
            {[
              { name: '1Y', start: '2023-01-01', end: '2024-01-01' },
              { name: '5Y', start: '2019-01-01', end: '2024-01-01' },
              { name: '10Y', start: '2014-01-01', end: '2024-01-01' },
              { name: '20Y', start: '2004-01-01', end: '2024-01-01' },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => updateTimeframe('chart4', { startDate: preset.start, endDate: preset.end })}
                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors border border-slate-600"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 5: Rolling Statistics */}
      <div className="card bg-slate-800 border-slate-700 p-3 shadow-lg">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
          <Activity size={16} className="text-orange-400" />
          Chart 5: Rolling Statistics (up to 4 series)
        </h4>
        
        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Add Variable:</label>
          <select
            onChange={(e) => {
              const variable = availableVariables.find(v => v.fredTicker === e.target.value);
              if (variable) addVariableToChart5(variable);
            }}
            className="select-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
            value=""
          >
            <option value="">Select variable...</option>
            {renderVariableOptions()}
          </select>
        </div>

        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Selected Variables:</label>
          <div className="space-y-1">
            {config.chart5.variables.map((variable) => (
              <div key={variable.fredTicker} className="flex items-center justify-between bg-slate-700 px-2 py-1 rounded border border-slate-600">
                <span className="text-xs text-slate-200">{variable.series}</span>
                <button
                  onClick={() => removeVariableFromChart5(variable.fredTicker)}
                  className="text-red-400 hover:text-red-300 text-xs hover:bg-slate-600 px-1 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Start Date:</label>
            <input
              type="date"
              value={config.chart5.timeframe.startDate}
              onChange={(e) => updateTimeframe('chart5', { startDate: e.target.value })}
              className="input-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">End Date:</label>
            <input
              type="date"
              value={config.chart5.timeframe.endDate}
              onChange={(e) => updateTimeframe('chart5', { endDate: e.target.value })}
              className="input-field text-xs h-8 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Chart 5 Quick Date Presets */}
        <div className="mt-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Quick Presets:</label>
          <div className="flex flex-wrap gap-1">
            {[
              { name: '1Y', start: '2023-01-01', end: '2024-01-01' },
              { name: '5Y', start: '2019-01-01', end: '2024-01-01' },
              { name: '10Y', start: '2014-01-01', end: '2024-01-01' },
              { name: '20Y', start: '2004-01-01', end: '2024-01-01' },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => updateTimeframe('chart5', { startDate: preset.start, endDate: preset.end })}
                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors border border-slate-600"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
