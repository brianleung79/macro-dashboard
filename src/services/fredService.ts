import axios from 'axios';
import { MacroVariable, TimeSeriesData, FREDResponse } from '../types';

// Debug environment variable loading
console.log('Environment variables check:');
console.log('REACT_APP_FRED_API_KEY:', process.env.REACT_APP_FRED_API_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Temporarily hardcode the API key to ensure it works
const FRED_API_KEY = 'abf2178d3c7946daaddfb379a2567750';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

export class FREDService {
  static async fetchTimeSeriesData(
    variable: MacroVariable,
    startDate: string,
    endDate: string
  ): Promise<TimeSeriesData[]> {
    try {
      console.log(`Fetching data for ${variable.series} (${variable.fredTicker})`);
      console.log(`API Key: ${FRED_API_KEY.substring(0, 8)}...`);
      console.log(`Full API Key: ${FRED_API_KEY}`);
      
      // Try direct API call first
      const targetUrl = `${FRED_BASE_URL}?series_id=${variable.fredTicker}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}&observation_end=${endDate}&frequency=m&aggregation_method=avg`;
      
      let response: any;
      try {
        // Try direct API call first
        console.log('Attempting direct API call...');
        response = await axios.get<FREDResponse>(targetUrl);
        console.log('Direct API call successful!');
      } catch (directError) {
        console.log('Direct API call failed, trying local CORS proxy...');
        // Use local CORS proxy server
        try {
          const proxyUrl = `http://localhost:3002/proxy/fred?url=${encodeURIComponent(targetUrl)}`;
          console.log('Trying local proxy:', proxyUrl);
          response = await axios.get<FREDResponse>(proxyUrl);
          console.log('Local proxy successful!');
        } catch (proxyError) {
          console.error('Local proxy failed:', proxyError);
          throw new Error('Local CORS proxy failed - make sure the proxy server is running');
        }
      }

      if (!response) {
        throw new Error('No response received from any method');
      }

      console.log(`Response received for ${variable.series}:`, response.data);

      // Check if response.data.observations exists
      if (!response.data || !response.data.observations) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response structure from FRED API');
      }

      return response.data.observations
        .filter((obs: any) => obs.value !== '.')
        .map((obs: any) => ({
          date: obs.date,
          value: parseFloat(obs.value),
          series: variable.series
        }));
    } catch (error) {
      console.error(`Error fetching data for ${variable.series}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Request URL:', error.config?.url);
        console.error('Request params:', error.config?.params);
      }
      throw error;
    }
  }

  static async fetchMultipleTimeSeries(
    variables: MacroVariable[],
    startDate: string,
    endDate: string
  ): Promise<TimeSeriesData[]> {
    const promises = variables.map(variable =>
      this.fetchTimeSeriesData(variable, startDate, endDate)
    );

    try {
      const results = await Promise.all(promises);
      return results.flat();
    } catch (error) {
      console.error('Error fetching multiple time series:', error);
      throw error;
    }
  }

  static calculateRollingCorrelation(
    data1: TimeSeriesData[],
    data2: TimeSeriesData[],
    windowSize?: number
  ): TimeSeriesData[] {
    // Auto-calculate window size if not provided (default to 12 months)
    if (!windowSize) {
      windowSize = 12;
    }

    const data1Map = new Map(data1.map(d => [d.date, d.value]));
    const data2Map = new Map(data2.map(d => [d.date, d.value]));

    const allDates = Array.from(new Set([...Array.from(data1Map.keys()), ...Array.from(data2Map.keys())])).sort();

    const correlations: TimeSeriesData[] = [];

    for (let i = windowSize - 1; i < allDates.length; i++) {
      const windowDates = allDates.slice(i - windowSize + 1, i + 1);
      const values1: number[] = [];
      const values2: number[] = [];

      windowDates.forEach(date => {
        const val1 = data1Map.get(date);
        const val2 = data2Map.get(date);
        if (val1 !== undefined && val2 !== undefined) {
          values1.push(val1);
          values2.push(val2);
        }
      });

      if (values1.length === windowSize && values2.length === windowSize) {
        const correlation = this.calculateCorrelation(values1, values2);
        correlations.push({
          date: allDates[i],
          value: correlation,
          series: 'Correlation'
        });
      }
    }

    return correlations;
  }

  static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  static calculateRatio(
    data1: TimeSeriesData[],
    data2: TimeSeriesData[]
  ): TimeSeriesData[] {
    const data1Map = new Map(data1.map(d => [d.date, d.value]));
    const data2Map = new Map(data2.map(d => [d.date, d.value]));
    
    const allDates = Array.from(new Set([...Array.from(data1Map.keys()), ...Array.from(data2Map.keys())])).sort();
    
    return allDates
      .map(date => {
        const val1 = data1Map.get(date);
        const val2 = data2Map.get(date);
        if (val1 !== undefined && val2 !== undefined && val2 !== 0) {
          return {
            date,
            value: val1 / val2,
            series: 'Ratio'
          };
        }
        return null;
      })
      .filter((item): item is TimeSeriesData => item !== null);
  }

  static calculateSpread(
    data1: TimeSeriesData[],
    data2: TimeSeriesData[]
  ): TimeSeriesData[] {
    const data1Map = new Map(data1.map(d => [d.date, d.value]));
    const data2Map = new Map(data2.map(d => [d.date, d.value]));
    
    const allDates = Array.from(new Set([...Array.from(data1Map.keys()), ...Array.from(data2Map.keys())])).sort();
    
    return allDates
      .map(date => {
        const val1 = data1Map.get(date);
        const val2 = data2Map.get(date);
        if (val1 !== undefined && val2 !== undefined) {
          return {
            date,
            value: val1 - val2,
            series: 'Spread'
          };
        }
        return null;
      })
      .filter((item): item is TimeSeriesData => item !== null);
  }

  static calculateRollingStatistics(
    data: TimeSeriesData[],
    windowSize?: number
  ): Array<{ date: string; rollingMean: number; rollingStd: number }> {
    // Auto-calculate window size if not provided (default to 12 months)
    if (!windowSize) {
      windowSize = 12;
    }

    const stats: Array<{ date: string; rollingMean: number; rollingStd: number }> = [];

    for (let i = windowSize - 1; i < data.length; i++) {
      const windowData = data.slice(i - windowSize + 1, i + 1);
      const values = windowData.map(d => d.value);

      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);

      stats.push({
        date: data[i].date,
        rollingMean: mean,
        rollingStd: std
      });
    }
    return stats;
  }
}
