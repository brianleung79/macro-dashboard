// Force new deployment - ETFs should now appear in Equity Factors category
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardControls } from './components/DashboardControls';
import { DashboardDisplay } from './components/DashboardDisplay';
import { DashboardConfig, MacroVariable, ChartData, TimeSeriesData } from './types';
import { FREDService } from './services/fredService';

import { DataLoader } from './utils/dataLoader';
import { Play, AlertCircle } from 'lucide-react';

function App() {
  const [availableVariables, setAvailableVariables] = useState<MacroVariable[]>([]);
  const [chartData, setChartData] = useState<{
    chart1: ChartData[];
    chart2: ChartData[];
    chart3: ChartData[];
    chart4: ChartData[];
    chart5: ChartData[];
  }>({
    chart1: [],
    chart2: [],
    chart3: [],
    chart4: [],
    chart5: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debug: Monitor chartData state changes
  useEffect(() => {
    console.log('🔄 chartData state changed:', chartData);
    console.log('Chart 1 state:', chartData.chart1);
    console.log('Chart 2 state:', chartData.chart2);
  }, [chartData]);

  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    chart1: {
      variables: [],
      timeframe: { startDate: '2019-01-01', endDate: '2024-01-01' }
    },
    chart2: {
      plotType: 'ratio',
      variable1: undefined,
      variable2: undefined,
      timeframe: { startDate: '2019-01-01', endDate: '2024-01-01' }
    },
    chart3: {
      plotType: 'ratio',
      variable1: undefined,
      variable2: undefined,
      timeframe: { startDate: '2019-01-01', endDate: '2024-01-01' }
    },
    chart4: {
      variablePairs: [],
      timeframe: { startDate: '2019-01-01', endDate: '2024-01-01' }
    },
    chart5: {
      variables: [],
      timeframe: { startDate: '2019-01-01', endDate: '2024-01-01' }
    }
  });

  useEffect(() => {
    loadVariables();
  }, []);

  // Add data availability check
  useEffect(() => {
    const checkDataAvailability = async () => {
      try {
        console.log('=== Checking Data Availability ===');
        const results = await DataLoader.checkAllVariablesDataAvailability();
        
        // Log summary to console
        const with20Years = results.filter(r => r.has20Years).length;
        const total = results.length;
        console.log(`📊 Data Availability Summary:`);
        console.log(`Total variables: ${total}`);
        console.log(`Variables with 20+ years: ${with20Years}`);
        console.log(`Variables with less than 20 years: ${total - with20Years}`);
        
        // Log details for variables without 20 years
        const without20Years = results.filter(r => !r.has20Years);
        if (without20Years.length > 0) {
          console.log(`\n⚠️ Variables with less than 20 years of data:`);
          without20Years.forEach(result => {
            const { variable, availability } = result;
            if (availability) {
              const startDate = new Date(availability.startDate);
              const endDate = new Date(availability.endDate);
              const yearsDiff = (endDate.getFullYear() - startDate.getFullYear()) + 
                               (endDate.getMonth() - startDate.getMonth()) / 12;
              console.log(`  ${variable.series}: ${yearsDiff.toFixed(1)} years (${availability.startDate} to ${availability.endDate})`);
            } else {
              console.log(`  ${variable.series}: Unknown availability`);
            }
          });
        }
      } catch (error) {
        console.error('Error checking data availability:', error);
      }
    };
    
    // Run after variables are loaded
    if (availableVariables.length > 0) {
      checkDataAvailability();
    }
  }, [availableVariables]);

  const loadVariables = async () => {
    try {
      const variables = await DataLoader.loadAllVariables();
      setAvailableVariables(variables);
    } catch (error) {
      console.error('Error loading variables:', error);
      setError('Failed to load available variables');
    }
  };



  // Utility function to convert TimeSeriesData to ChartData
  const convertToChartData = (timeSeriesData: TimeSeriesData[]): ChartData[] => {
    const seriesMap = new Map<string, TimeSeriesData[]>();
    
    timeSeriesData.forEach(item => {
      if (!seriesMap.has(item.series)) {
        seriesMap.set(item.series, []);
      }
      seriesMap.get(item.series)!.push(item);
    });

    return Array.from(seriesMap.entries()).map(([seriesName, data]) => ({
      x: data.map(d => d.date),
      y: data.map(d => d.value),
      name: seriesName,
      type: 'scatter' as const,
      mode: 'lines' as const
    }));
  };

  // Utility function to convert ratio data to ChartData
  const convertRatioToChartData = (ratioData: TimeSeriesData[]): ChartData[] => {
    return [{
      x: ratioData.map(d => d.date),
      y: ratioData.map(d => d.value),
      name: 'Ratio',
      type: 'scatter' as const,
      mode: 'lines' as const
    }];
  };

  const runDashboardAnalysis = async () => {
    console.log('=== Starting Dashboard Analysis ===');
    console.log('Dashboard Config:', dashboardConfig);
    console.log('Available Variables:', availableVariables);
    
    setIsLoading(true);
    setError(null);

    try {
      const newChartData = {
        chart1: [] as ChartData[],
        chart2: [] as ChartData[],
        chart3: [] as ChartData[],
        chart4: [] as ChartData[],
        chart5: [] as ChartData[]
      };

      // Chart 1: Price Chart
      if (dashboardConfig.chart1.variables.length > 0) {
        console.log('Processing Chart 1 with variables:', dashboardConfig.chart1.variables);
        const timeSeriesData = await FREDService.fetchMultipleTimeSeries(
          dashboardConfig.chart1.variables,
          dashboardConfig.chart1.timeframe.startDate,
          dashboardConfig.chart1.timeframe.endDate
        );
        console.log('Chart 1 data received:', timeSeriesData);
        newChartData.chart1 = convertToChartData(timeSeriesData);
        console.log('Chart 1 converted data:', newChartData.chart1);
        console.log('Chart 1 data structure details:', {
          length: newChartData.chart1.length,
          firstSeries: newChartData.chart1[0],
          xLength: newChartData.chart1[0]?.x?.length,
          yLength: newChartData.chart1[0]?.y?.length,
          sampleX: newChartData.chart1[0]?.x?.slice(0, 3),
          sampleY: newChartData.chart1[0]?.y?.slice(0, 3)
        });
      } else {
        console.log('Chart 1: No variables selected');
      }

      // Chart 2: Ratio/Spread
      if (dashboardConfig.chart2.variable1 && dashboardConfig.chart2.variable2) {
        console.log('Processing Chart 2 with variables:', dashboardConfig.chart2.variable1, dashboardConfig.chart2.variable2);
        const data1 = await FREDService.fetchTimeSeriesData(
          dashboardConfig.chart2.variable1,
          dashboardConfig.chart2.timeframe.startDate,
          dashboardConfig.chart2.timeframe.endDate
        );
        const data2 = await FREDService.fetchTimeSeriesData(
          dashboardConfig.chart2.variable2,
          dashboardConfig.chart2.timeframe.startDate,
          dashboardConfig.chart2.timeframe.endDate
        );

        if (dashboardConfig.chart2.plotType === 'ratio') {
          const ratioData = FREDService.calculateRatio(data1, data2);
          newChartData.chart2 = convertRatioToChartData(ratioData);
        } else {
          // Spread calculation
          const spreadData = FREDService.calculateSpread(data1, data2);
          newChartData.chart2 = [{
            x: spreadData.map((d: any) => d.date),
            y: spreadData.map((d: any) => d.value),
            name: `${dashboardConfig.chart2.variable1.series} - ${dashboardConfig.chart2.variable2.series}`,
            type: 'scatter' as const,
            mode: 'lines' as const
          }];
        }
        console.log('Chart 2 data:', newChartData.chart2);
        console.log('Chart 2 data structure details:', {
          length: newChartData.chart2.length,
          firstSeries: newChartData.chart2[0],
          xLength: newChartData.chart2[0]?.x?.length,
          yLength: newChartData.chart2[0]?.y?.length,
          sampleX: newChartData.chart2[0]?.x?.slice(0, 3),
          sampleY: newChartData.chart2[0]?.y?.slice(0, 3)
        });
      } else {
        console.log('Chart 2: Missing variables');
      }

      // Chart 3: Ratio/Spread
      if (dashboardConfig.chart3.variable1 && dashboardConfig.chart3.variable2) {
        const data1 = await FREDService.fetchTimeSeriesData(
          dashboardConfig.chart3.variable1,
          dashboardConfig.chart3.timeframe.startDate,
          dashboardConfig.chart3.timeframe.endDate
        );
        const data2 = await FREDService.fetchTimeSeriesData(
          dashboardConfig.chart3.variable2,
          dashboardConfig.chart3.timeframe.startDate,
          dashboardConfig.chart3.timeframe.endDate
        );

        if (dashboardConfig.chart3.plotType === 'ratio') {
          const ratioData = FREDService.calculateRatio(data1, data2);
          newChartData.chart3 = convertRatioToChartData(ratioData);
        } else {
          // Spread calculation
          const spreadData = FREDService.calculateSpread(data1, data2);
          newChartData.chart3 = [{
            x: spreadData.map((d: any) => d.date),
            y: spreadData.map((d: any) => d.value),
            name: `${dashboardConfig.chart3.variable1.series} - ${dashboardConfig.chart3.variable2.series}`,
            type: 'scatter' as const,
            mode: 'lines' as const
          }];
        }
      }

      // Chart 4: Rolling Correlations
      if (dashboardConfig.chart4.variablePairs.length > 0) {
        const correlationPromises = dashboardConfig.chart4.variablePairs.map(async (pair) => {
          const data1 = await FREDService.fetchTimeSeriesData(
            pair.var1,
            dashboardConfig.chart4.timeframe.startDate,
            dashboardConfig.chart4.timeframe.endDate
          );
          const data2 = await FREDService.fetchTimeSeriesData(
            pair.var2,
            dashboardConfig.chart4.timeframe.startDate,
            dashboardConfig.chart4.timeframe.endDate
          );

          // Auto-calculate window size based on date range
          const startDate = new Date(dashboardConfig.chart4.timeframe.startDate);
          const endDate = new Date(dashboardConfig.chart4.timeframe.endDate);
          const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                            (endDate.getMonth() - startDate.getMonth());
          const windowSize = Math.max(6, Math.min(60, Math.floor(monthsDiff / 4))); // Adaptive window size

          const correlationData = FREDService.calculateRollingCorrelation(
            data1,
            data2,
            windowSize
          );

          return [
            {
              x: correlationData.map((d: any) => d.date),
              y: correlationData.map((d: any) => d.value),
              name: `${pair.var1.series} vs ${pair.var2.series}`,
              type: 'scatter' as const,
              mode: 'lines' as const
            }
          ];
        });

        const correlationResults = await Promise.all(correlationPromises);
        newChartData.chart4 = correlationResults.flat();
      }

      // Chart 5: Rolling Statistics
      if (dashboardConfig.chart5.variables.length > 0) {
        const statsPromises = dashboardConfig.chart5.variables.map(async (variable) => {
          const data = await FREDService.fetchTimeSeriesData(
            variable,
            dashboardConfig.chart5.timeframe.startDate,
            dashboardConfig.chart5.timeframe.endDate
          );

          // Auto-calculate window size based on date range
          const startDate = new Date(dashboardConfig.chart5.timeframe.startDate);
          const endDate = new Date(dashboardConfig.chart5.timeframe.endDate);
          const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                            (endDate.getMonth() - startDate.getMonth());
          const windowSize = Math.max(6, Math.min(60, Math.floor(monthsDiff / 4))); // Adaptive window size

          const rollingStats = FREDService.calculateRollingStatistics(data, windowSize);
          
          return [
            {
              x: rollingStats.rollingMean.map((d: any) => d.date),
              y: rollingStats.rollingMean.map((d: any) => d.value),
              name: `${variable.series} - Rolling Mean`,
              type: 'scatter' as const,
              mode: 'lines' as const
            },
            {
              x: rollingStats.rollingStd.map((d: any) => d.date),
              y: rollingStats.rollingStd.map((d: any) => d.value),
              name: `${variable.series} - Rolling Std`,
              type: 'scatter' as const,
              mode: 'lines' as const
            }
          ];
        });

        const statsResults = await Promise.all(statsPromises);
        newChartData.chart5 = statsResults.flat();
      }

      setChartData(newChartData);
      console.log('=== Final Chart Data Set ===');
      console.log('Final chartData state:', newChartData);
      console.log('Chart 1 final state:', newChartData.chart1);
      console.log('Chart 2 final state:', newChartData.chart2);
      
      // Detailed structure logging
      console.log('🔍 Detailed newChartData structure:');
      console.log('newChartData type:', typeof newChartData);
      console.log('newChartData keys:', Object.keys(newChartData));
      console.log('newChartData.chart1 type:', typeof newChartData.chart1);
      console.log('newChartData.chart1 length:', newChartData.chart1?.length);
      console.log('newChartData.chart1[0]:', newChartData.chart1?.[0]);
      
      console.log('🔄 About to call setChartData with:', newChartData);
      setChartData(newChartData);
      console.log('✅ setChartData called successfully');
      
      // Verify the state was updated
      setTimeout(() => {
        console.log('⏰ State after 100ms:', chartData);
      }, 100);
      
    } catch (error) {
      console.error('Dashboard analysis error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const canRunAnalysis = () => {
    return (
      dashboardConfig.chart1.variables.length > 0 ||
      (dashboardConfig.chart2.variable1 && dashboardConfig.chart2.variable2) ||
      (dashboardConfig.chart3.variable1 && dashboardConfig.chart3.variable2) ||
      dashboardConfig.chart4.variablePairs.length > 0 ||
      dashboardConfig.chart5.variables.length > 0
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header title="VectorStrat Macro Economic Dashboard" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-4">
            <DashboardControls
              config={dashboardConfig}
              onConfigChange={setDashboardConfig}
              availableVariables={availableVariables}
            />
            

            
            <div className="card bg-slate-800 border-slate-700 p-3 shadow-lg">
              <button
                onClick={runDashboardAnalysis}
                disabled={!canRunAnalysis() || isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={12} />
                    Run Analysis
                  </>
                )}
              </button>
              
              {error && (
                <div className="mt-4 p-2 bg-red-900/20 border border-red-700/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertCircle size={12} />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Dashboard Display */}
          <div className="lg:col-span-3">
            <DashboardDisplay
              config={dashboardConfig}
              chartData={chartData}
            />
          </div>
        </div>
        
        {/* Source Citations */}
        <div className="mt-12 pb-8 border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="text-center text-xs text-slate-500">
              <p className="mb-2">Data Sources:</p>
              <div className="flex justify-center space-x-6">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  FRED (Federal Reserve Economic Data)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  Alpha Vantage (ETF Data)
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
