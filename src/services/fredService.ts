import axios from 'axios';
import { MacroVariable, TimeSeriesData, FREDResponse } from '../types';

// FRED API configuration
const FRED_API_KEY = 'abf2178d3c7946daaddfb379a2567750';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

export class FREDService {
  // Base URL for the backend proxy (change this to your deployed backend URL)
  private static BACKEND_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com' 
    : 'http://localhost:3001';

  static async fetchTimeSeriesData(
    variable: MacroVariable,
    startDate: string,
    endDate: string
  ): Promise<TimeSeriesData[]> {
    try {
      console.log(`=== Fetching data for ${variable.series} (${variable.fredTicker}) ===`);
      console.log(`Date range: ${startDate} to ${endDate}`);
      
      // Try backend proxy first
      try {
        console.log('Trying backend proxy...');
        const proxyUrl = `${this.BACKEND_URL}/api/fred/${variable.fredTicker}?start=${startDate}&end=${endDate}`;
        console.log('Backend proxy URL:', proxyUrl);
        
        const response = await axios.get(proxyUrl, {
          timeout: 30000
        });
        
        console.log('Backend proxy successful!');
        console.log('Number of observations:', response.data.observations?.length || 0);
        
        if (!response.data || !response.data.observations) {
          throw new Error('Invalid response from backend proxy');
        }
        
        const filteredData = response.data.observations
          .filter((obs: any) => obs.value !== '.')
          .map((obs: any) => ({
            date: obs.date,
            value: parseFloat(obs.value),
            series: variable.series
          }));
        
        console.log(`Filtered data points: ${filteredData.length}`);
        return filteredData;
        
      } catch (proxyError) {
        console.log('Backend proxy failed, falling back to CORS proxies...');
        console.error('Proxy error:', proxyError);
        
        // Fallback to CORS proxies for development
        if (process.env.NODE_ENV === 'development') {
          return this.fetchWithCORSProxies(variable, startDate, endDate);
        } else {
          throw new Error('Backend proxy is required in production. Please ensure the backend service is running.');
        }
      }
      
    } catch (error) {
      console.error(`Error fetching data for ${variable.series}:`, error);
      throw error;
    }
  }

  // Fallback method using CORS proxies (development only)
  private static async fetchWithCORSProxies(
    variable: MacroVariable,
    startDate: string,
    endDate: string
  ): Promise<TimeSeriesData[]> {
    const targetUrl = `${FRED_BASE_URL}?series_id=${variable.fredTicker}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}&observation_end=${endDate}&frequency=m&aggregation_method=avg`;
    
    console.log('Target URL:', targetUrl);
    
    let response: any;
    
    // Try public CORS proxies in order of preference
    const corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://thingproxy.freeboard.io/fetch/',
      'https://cors-anywhere.herokuapp.com/'
    ];
    
    for (const proxy of corsProxies) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(targetUrl)}`;
        console.log('Trying CORS proxy:', proxy);
        
        response = await axios.get<FREDResponse>(proxyUrl, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.data || !response.data.observations) {
          console.error('Invalid API response:', response.data);
          continue;
        }
        
        console.log('CORS proxy successful:', proxy);
        break;
      } catch (error) {
        console.error(`CORS proxy ${proxy} failed:`, error);
        continue;
      }
    }
    
    if (!response || !response.data || !response.data.observations) {
      throw new Error('All CORS proxies failed. This is likely due to CORS restrictions in production.');
    }
    
    return response.data.observations
      .filter((obs: any) => obs.value !== '.')
      .map((obs: any) => ({
        date: obs.date,
        value: parseFloat(obs.value),
        series: variable.series
      }));
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

  static calculateRollingStatistics(
    data: TimeSeriesData[],
    windowSize?: number
  ): { rollingMean: TimeSeriesData[], rollingStd: TimeSeriesData[] } {
    // Auto-calculate window size if not provided (default to 12 months)
    if (!windowSize) {
      windowSize = 12;
    }
  
    const dataMap = new Map(data.map(d => [d.date, d.value]));
    const allDates = Array.from(dataMap.keys()).sort();
  
    const rollingMean: TimeSeriesData[] = [];
    const rollingStd: TimeSeriesData[] = [];
  
    for (let i = windowSize - 1; i < allDates.length; i++) {
      const windowDates = allDates.slice(i - windowSize + 1, i + 1);
      const values = windowDates.map(date => dataMap.get(date)).filter(val => val !== undefined) as number[];
  
      if (values.length === windowSize) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const std = Math.sqrt(variance);
  
        rollingMean.push({
          date: allDates[i],
          value: mean,
          series: 'Rolling Mean'
        });
  
        rollingStd.push({
          date: allDates[i],
          value: std,
          series: 'Rolling Std Dev'
        });
      }
    }
  
    return { rollingMean, rollingStd };
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

  private static calculateCorrelation(values1: number[], values2: number[]): number {
    if (values1.length !== values2.length || values1.length === 0) {
      return 0;
    }
  
    const n = values1.length;
    const sum1 = values1.reduce((sum, val) => sum + val, 0);
    const sum2 = values2.reduce((sum, val) => sum + val, 0);
    const sum1Sq = values1.reduce((sum, val) => sum + val * val, 0);
    const sum2Sq = values2.reduce((sum, val) => sum + val * val, 0);
    const sum1Times2 = values1.reduce((sum, val, i) => sum + val * values2[i], 0);
  
    const numerator = n * sum1Times2 - sum1 * sum2;
    const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));
  
    return denominator === 0 ? 0 : numerator / denominator;
  }
}
