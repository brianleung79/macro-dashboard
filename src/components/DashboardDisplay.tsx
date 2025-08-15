import React, { useEffect } from 'react';
import { DashboardConfig, ChartData } from '../types';
import { ChartDisplay } from './ChartDisplay';

interface DashboardDisplayProps {
  config: DashboardConfig;
  chartData: {
    chart1: ChartData[];
    chart2: ChartData[];
    chart3: ChartData[];
    chart4: ChartData[];
    chart5: ChartData[];
  };
}

export const DashboardDisplay: React.FC<DashboardDisplayProps> = ({
  config,
  chartData
}) => {
  // Debug: Log when props change
  useEffect(() => {
    console.log('📊 DashboardDisplay received new props:');
    console.log('Config:', config);
    console.log('Chart Data:', chartData);
    console.log('Chart 1 data length:', chartData.chart1?.length);
    console.log('Chart 2 data length:', chartData.chart2?.length);
  }, [config, chartData]);

  return (
    <div className="h-full flex flex-col">
      {/* Chart 1: Price Chart */}
      <div className="card bg-slate-700 border-slate-600 p-3 shadow-lg mb-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Chart 1: Price Chart</h3>
        <div className="h-96 w-full">
          <ChartDisplay
            key="chart1"
            data={chartData.chart1}
            config={{
              title: 'Price', // Clean title without "Chart"
              xaxis: { title: 'Date' },
              yaxis: { title: 'Value' },
              showlegend: true
            }}
            isLoading={false}
            error={null}
          />
        </div>
      </div>

      {/* Chart 2: Ratio/Spread */}
      <div className="card bg-slate-700 border-slate-600 p-3 shadow-lg mb-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          Chart 2: {config.chart2.plotType === 'ratio' ? 'Ratio' : 'Spread'}
        </h3>
        <div className="h-96 w-full">
          <ChartDisplay
            key="chart2"
            data={chartData.chart2}
            config={{
              title: config.chart2.plotType === 'ratio' ? 'Ratio Analysis' : 'Spread Analysis',
              xaxis: { title: 'Date' },
              yaxis: { title: config.chart2.plotType === 'ratio' ? 'Ratio' : 'Spread' },
              showlegend: true
            }}
            isLoading={false}
            error={null}
          />
        </div>
      </div>

      {/* Chart 3: Ratio/Spread */}
      <div className="card bg-slate-700 border-slate-600 p-3 shadow-lg mb-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          Chart 3: {config.chart3.plotType === 'ratio' ? 'Ratio' : 'Spread'}
        </h3>
        <div className="h-96 w-full">
          <ChartDisplay
            key="chart3"
            data={chartData.chart3}
            config={{
              title: config.chart3.plotType === 'ratio' ? 'Ratio Analysis' : 'Spread Analysis',
              xaxis: { title: 'Date' },
              yaxis: { title: config.chart3.plotType === 'ratio' ? 'Ratio' : 'Spread' },
              showlegend: true
            }}
            isLoading={false}
            error={null}
          />
        </div>
      </div>

      {/* Chart 4: Rolling Correlations */}
      <div className="card bg-slate-700 border-slate-600 p-3 shadow-lg mb-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Chart 4: Rolling Correlations</h3>
        <div className="h-96 w-full">
          <ChartDisplay
            key="chart4"
            data={chartData.chart4}
            config={{
              title: 'Rolling Correlations',
              xaxis: { title: 'Date' },
              yaxis: { title: 'Correlation Coefficient' },
              showlegend: true
            }}
            isLoading={false}
            error={null}
          />
        </div>
      </div>

      {/* Chart 5: Rolling Statistics */}
      <div className="card bg-slate-700 border-slate-600 p-3 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Chart 5: Rolling Statistics</h3>
        <div className="h-96 w-full">
          <ChartDisplay
            key="chart5"
            data={chartData.chart5}
            config={{
              title: 'Rolling Statistics',
              xaxis: { title: 'Date' },
              yaxis: { title: 'Value' },
              showlegend: true
            }}
            isLoading={false}
            error={null}
          />
        </div>
      </div>
    </div>
  );
};
