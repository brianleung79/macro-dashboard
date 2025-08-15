import React, { useEffect } from 'react';
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
  // Debug logging
  useEffect(() => {
    console.log('🔍 ChartDisplay useEffect triggered:');
    console.log('  - data prop:', data);
    console.log('  - data type:', typeof data);
    console.log('  - data length:', data?.length);
    console.log('  - data[0]:', data?.[0]);
    console.log('  - config:', config);
    console.log('  - isLoading:', isLoading);
    console.log('  - error:', error);

    if (data && data.length > 0) {
      console.log('  ✅ Data is present:');
      console.log('    - First series name:', data[0].name);
      console.log('    - First series x length:', data[0].x?.length);
      console.log('    - First series y length:', data[0].y?.length);
      console.log('    - Sample x values:', data[0].x?.slice(0, 3));
      console.log('    - Sample y values:', data[0].y?.slice(0, 3));
    } else {
      console.log('  ❌ Data is missing or empty');
    }
  }, [data, config, isLoading, error]);

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

  // Frequency matching logic - find common frequency between time series
  const findCommonFrequency = (data: ChartData[]) => {
    if (data.length <= 1) return data;
    
    // Analyze the frequency of each series
    const frequencies = data.map(series => {
      if (!series.x || series.x.length < 2) return { series, frequency: 'unknown' };
      
      const dates = series.x.map(dateStr => new Date(dateStr));
      const intervals = [];
      
      for (let i = 1; i < dates.length; i++) {
        const diff = dates[i].getTime() - dates[i-1].getTime();
        intervals.push(diff);
      }
      
      // Find the most common interval
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      
      // Categorize frequency
      let frequency;
      if (avgInterval <= 24 * 60 * 60 * 1000) frequency = 'daily';
      else if (avgInterval <= 7 * 24 * 60 * 60 * 1000) frequency = 'weekly';
      else if (avgInterval <= 30 * 24 * 60 * 60 * 1000) frequency = 'monthly';
      else if (avgInterval <= 90 * 24 * 60 * 60 * 1000) frequency = 'quarterly';
      else frequency = 'yearly';
      
      return { series, frequency, avgInterval };
    });
    
    // Find the lowest frequency (highest interval) to use as common frequency
    const frequencyOrder = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
    const lowestFrequency = frequencies.reduce((lowest, current) => {
      const lowestIndex = frequencyOrder.indexOf(lowest.frequency);
      const currentIndex = frequencyOrder.indexOf(current.frequency);
      return currentIndex > lowestIndex ? current : lowest;
    });
    
    console.log('🔍 Frequency analysis:', {
      series: frequencies.map(f => ({ name: f.series.name, frequency: f.frequency })),
      commonFrequency: lowestFrequency.frequency
    });
    
    return data; // For now, return original data. We'll implement resampling later
  };

  // Apply frequency matching
  const frequencyMatchedData = findCommonFrequency(data);

  // Smart axis formatting based on data type
  const determineAxisFormat = (data: ChartData[]) => {
    if (!data || data.length === 0) return { yFormat: '.2f', ySuffix: '' };
    
    // Analyze the data to determine type and appropriate formatting
    const firstSeries = data[0];
    if (!firstSeries.y || firstSeries.y.length === 0) return { yFormat: '.2f', ySuffix: '' };
    
    const values = firstSeries.y.filter(y => typeof y === 'number' && !isNaN(y));
    if (values.length === 0) return { yFormat: '.2f', ySuffix: '' };
    
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue;
    
    // Determine data type based on series name and values
    const seriesName = firstSeries.name?.toLowerCase() || '';
    
    // Interest rates (typically 0-20 range)
    if (seriesName.includes('rate') || seriesName.includes('yield') || 
        seriesName.includes('spread') || (avgValue >= 0 && avgValue <= 20)) {
      if (range < 1) {
        return { yFormat: '.0f', ySuffix: ' bps' }; // Basis points for small ranges
      } else {
        return { yFormat: '.2f', ySuffix: ' %' }; // Percentage for larger ranges
      }
    }
    
    // Prices (typically larger values, often need 2 decimal places)
    if (seriesName.includes('price') || seriesName.includes('index') || 
        avgValue > 100) {
      return { yFormat: '.2f', ySuffix: '' };
    }
    
    // Currencies (typically need 3 decimal places)
    if (seriesName.includes('currency') || seriesName.includes('exchange') || 
        seriesName.includes('forex')) {
      return { yFormat: '.3f', ySuffix: '' };
    }
    
    // Growth metrics (typically percentages)
    if (seriesName.includes('growth') || seriesName.includes('change') || 
        seriesName.includes('return')) {
      if (Math.abs(avgValue) < 1) {
        return { yFormat: '.0f', ySuffix: ' bps' };
      } else {
        return { yFormat: '.2f', ySuffix: ' %' };
      }
    }
    
    // Default formatting
    return { yFormat: '.2f', ySuffix: '' };
  };

  // Get axis formatting
  const axisFormat = determineAxisFormat(data);
  
  console.log('🎯 Axis formatting:', {
    seriesNames: data.map(s => s.name),
    format: axisFormat.yFormat,
    suffix: axisFormat.ySuffix
  });

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

  const processedData = frequencyMatchedData.map((series, index) => {
    const color = getSeriesColor(index);
    let yaxis = 'y'; // Always use the same y-axis for now

    // Debug: Log the processed data
    console.log(`🔧 Processing series ${index}:`, {
      name: series.name,
      xLength: series.x?.length,
      yLength: series.y?.length,
      sampleX: series.x?.slice(0, 3),
      sampleY: series.y?.slice(0, 3),
      xType: typeof series.x?.[0],
      yType: typeof series.y?.[0],
      color: color,
      yaxis: yaxis
    });

    return {
      ...series,
      line: { color },
      marker: { color },
      yaxis,
      hovertemplate: `<b>${series.name}</b><br>Date: %{x}<br>Value: %{y}<extra></extra>`
    };
  });

  console.log('🎯 Final processedData for Plotly:', processedData);
  console.log('🎯 processedData[0] details:', {
    name: processedData[0]?.name,
    x: processedData[0]?.x?.slice(0, 5),
    y: processedData[0]?.y?.slice(0, 5),
    type: processedData[0]?.type,
    mode: processedData[0]?.mode,
    line: processedData[0]?.line,
    yaxis: processedData[0]?.yaxis
  });
  
  if (processedData.length > 1) {
    console.log('🎯 processedData[1] details:', {
      name: processedData[1]?.name,
      x: processedData[1]?.x?.slice(0, 5),
      y: processedData[1]?.y?.slice(0, 5),
      type: processedData[1]?.type,
      mode: processedData[1]?.mode,
      line: processedData[1]?.line,
      yaxis: processedData[1]?.yaxis
    });
  }

  const layout = {
    title: {
      text: config.title?.replace(' Chart', '').replace('Chart ', '') || 'Data Visualization', // Remove "Chart" word
      font: { color: '#e2e8f0', size: 16 }, // Light title text with good contrast
      x: 0.5 // Center the title
    },
    xaxis: {
      title: config.xaxis?.title || 'Date',
      gridcolor: '#64748b',
      zerolinecolor: '#64748b',
      showgrid: true,
      showline: true,
      linecolor: '#94a3b8',
      color: '#e2e8f0', // Light text for better contrast
      titlefont: { color: '#e2e8f0', size: 14 } // Light title text
    },
    yaxis: {
      title: config.yaxis?.title || 'Value',
      gridcolor: '#64748b',
      zerolinecolor: '#64748b',
      showgrid: true,
      showline: true,
      linecolor: '#94a3b8',
      color: '#e2e8f0', // Light text for better contrast
      titlefont: { color: '#e2e8f0', size: 14 }, // Light title text
      tickformat: axisFormat.yFormat, // Smart decimal formatting
      ticksuffix: axisFormat.ySuffix // Smart units (%, bps, etc.)
    },
    plot_bgcolor: '#1e293b', // Even darker slate-800 background - minimal glow
    paper_bgcolor: 'rgba(0,0,0,0)', // Transparent paper background
    showlegend: config.showlegend !== false,
    legend: {
      bgcolor: 'rgba(0,0,0,0)',
      bordercolor: '#94a3b8',
      borderwidth: 1,
      orientation: 'h', // Horizontal layout
      x: 0.5, // Center horizontally
      y: -0.25, // Move further below to avoid overlap with x-axis label
      xanchor: 'center', // Center the legend
      yanchor: 'top', // Anchor to top of legend
      font: { color: '#e2e8f0', size: 12 } // Light text for better contrast
    },
    margin: { l: 60, r: 30, t: 40, b: 100 }, // Increased bottom margin to prevent overlap
    autosize: true,
    height: undefined // Let Plotly determine height dynamically
  };

  return (
    <div className="w-full h-full">
      <div id="chart-container" className="w-full h-full">
        <Plot
          data={processedData as any}
          layout={layout as any}
          config={plotlyConfig as any}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
          onError={(error) => {
            console.error('🚨 Plotly error:', error);
          }}
          onInitialized={(figure) => {
            console.log('✅ Plotly initialized successfully:', figure);
          }}
          onUpdate={(figure) => {
            console.log('🔄 Plotly updated:', figure);
          }}
        />
      </div>
    </div>
  );
};
