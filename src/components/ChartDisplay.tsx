import React from 'react';
import Plot from 'react-plotly.js';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { ChartData, ChartConfig } from '../types';

interface ChartDisplayProps {
  data: ChartData[];
  config: ChartConfig;
  isLoading: boolean;
  error: string | null;
  title?: string;
}

export const ChartDisplay: React.FC<ChartDisplayProps> = ({
  data,
  config,
  isLoading,
  error,
  title
}) => {
  const handleDownload = () => {
    const plotDiv = document.getElementById('chart-container');
    if (plotDiv) {
      // This would need to be implemented with Plotly's download functionality
      console.log('Download functionality would be implemented here');
    }
  };

  if (isLoading) {
    return (
      <div className="card bg-slate-800 border-slate-700">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-blue-400" size={32} />
            <p className="text-slate-300">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-slate-800 border-slate-700">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={32} />
            <p className="text-red-300 font-medium">Error loading chart</p>
            <p className="text-slate-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card bg-slate-800 border-slate-700">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-slate-400">No data available for the selected configuration.</p>
            <p className="text-slate-500 text-sm mt-1">Please select variables and configure your analysis.</p>
          </div>
        </div>
      </div>
    );
  }

  const plotlyConfig = {
    displayModeBar: true,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    displaylogo: false,
    responsive: true
  };

  const getSeriesColor = (index: number): string => {
    const colors = [
      '#3B82F6', // blue-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#8B5CF6', // violet-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#EC4899', // pink-500
      '#6B7280', // gray-500
    ];
    return colors[index % colors.length];
  };

  const processedData = data.map((series, index) => {
    const color = getSeriesColor(index);
    let yaxis = 'y';
    
    // Assign different y-axes for better visibility
    if (data.length > 1) {
      if (index === 0) yaxis = 'y';
      else if (index === 1) yaxis = 'y2';
      else if (index === 2) yaxis = 'y3';
      else if (index === 3) yaxis = 'y4';
      else yaxis = 'y'; // Fallback to primary axis
    }

    return {
      ...series,
      line: { color },
      marker: { color },
      yaxis,
      hovertemplate: `<b>${series.name}</b><br>Date: %{x}<br>Value: %{y}<extra></extra>`
    };
  });

  const layout = {
    title: {
      text: config.title,
      font: { color: '#e2e8f0' }, // slate-200 for light text on dark background
      x: 0.5
    },
    xaxis: {
      title: config.xaxis?.title,
      gridcolor: '#475569', // slate-600 for subtle grid
      color: '#e2e8f0', // slate-200 for axis text
      showline: true,
      linecolor: '#64748b' // slate-500 for axis line
    },
    yaxis: {
      title: config.yaxis?.title,
      gridcolor: '#475569', // slate-600 for subtle grid
      color: '#e2e8f0', // slate-200 for axis text
      showline: true,
      linecolor: '#64748b' // slate-500 for axis line
    },
    yaxis2: data.length > 1 ? {
      title: 'Secondary Scale',
      gridcolor: '#475569',
      color: '#e2e8f0',
      showline: true,
      linecolor: '#64748b',
      overlaying: 'y',
      side: 'right'
    } : undefined,
    yaxis3: data.length > 2 ? {
      title: 'Tertiary Scale',
      gridcolor: '#475569',
      color: '#e2e8f0',
      showline: true,
      linecolor: '#64748b',
      overlaying: 'y',
      side: 'right',
      position: 0.95
    } : undefined,
    yaxis4: data.length > 3 ? {
      title: 'Quaternary Scale',
      gridcolor: '#475569',
      color: '#e2e8f0',
      showline: true,
      linecolor: '#64748b',
      overlaying: 'y',
      side: 'right',
      position: 0.9
    } : undefined,
    legend: {
      font: { color: '#e2e8f0' }, // slate-200 for light text
      bgcolor: 'rgba(30, 41, 59, 0.9)', // slate-800 with transparency
      bordercolor: '#475569' // slate-600 for border
    },
    plot_bgcolor: '#334155', // slate-700 - slightly lighter than page background
    paper_bgcolor: '#334155', // slate-700 - slightly lighter than page background
    font: { color: '#e2e8f0' }, // slate-200 for general text
    height: 400,
    margin: { t: 50, r: 50, b: 50, l: 50 }
  };

  return (
    <div className="card bg-slate-800 border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">
          {title || config.title}
        </h3>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-300 hover:text-slate-100 transition-colors bg-slate-700 hover:bg-slate-600 rounded"
        >
          <Download size={16} />
          Download
        </button>
      </div>
      
      <div id="chart-container" className="w-full">
        <Plot
          data={processedData as any}
          layout={layout as any}
          config={plotlyConfig as any}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>
    </div>
  );
};
