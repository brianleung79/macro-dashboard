import axios from 'axios';
import { MacroVariable, TimeSeriesData, FREDResponse } from '../types';
import { AlphaVantageService } from './alphaVantageService';

export class FREDService {
  // All FRED requests go through the serverless proxy
  private static BACKEND_URL = '/api';

  static async fetchTimeSeriesData(
    variable: MacroVariable,
    startDate: string,
    endDate: string
  ): Promise<TimeSeriesData[]> {
    // Check if this is an ETF (has category/subcategory) or if the symbol is available through Alpha Vantage
    if (variable.category && variable.subcategory || AlphaVantageService.isSymbolAvailable(variable.fredTicker)) {
      // This is an ETF or Alpha Vantage symbol, use Alpha Vantage
      try {
        const etfData = await AlphaVantageService.fetchDailyData(variable.fredTicker);
        return etfData.map(d => ({
          date: d.date,
          value: d.close,
          series: variable.series
        }));
      } catch (error) {
        console.error(`Error fetching ETF data for ${variable.fredTicker}:`, error);
        throw error;
      }
    }
    try {
      const proxyUrl = `${this.BACKEND_URL}/fred/${variable.fredTicker}?start=${startDate}&end=${endDate}`;

      const response = await axios.get(proxyUrl, { timeout: 30000 });

      if (!response.data || !response.data.observations) {
        throw new Error(`Invalid response for ${variable.fredTicker}`);
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

  // Check data availability range for a variable
  static async checkDataAvailability(variable: MacroVariable): Promise<{ startDate: string; endDate: string; dataPoints: number } | null> {
    try {
      // For ETFs, we'll use a default range since Alpha Vantage data is typically recent
      if (variable.category && variable.subcategory) {
        return {
          startDate: '2010-01-01', // ETFs typically have data from around 2010
          endDate: new Date().toISOString().split('T')[0],
          dataPoints: 0 // We can't easily determine this without fetching
        };
      }

      // For FRED variables, try to get series info
      try {
        const response = await axios.get(`${this.BACKEND_URL}/fred/${variable.fredTicker}/info`);
        if (response.data && response.data.observation_start && response.data.observation_end) {
          return {
            startDate: response.data.observation_start,
            endDate: response.data.observation_end,
            dataPoints: response.data.observation_count || 0
          };
        }
      } catch (error) {
        console.log(`Could not get info for ${variable.fredTicker}, trying to fetch sample data`);
      }

      // Fallback: try to fetch a small sample to determine range
      try {
        const sampleData = await this.fetchTimeSeriesData(variable, '2000-01-01', new Date().toISOString().split('T')[0]);
        if (sampleData.length > 0) {
          const dates = sampleData.map(d => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime());
          return {
            startDate: dates[0].toISOString().split('T')[0],
            endDate: dates[dates.length - 1].toISOString().split('T')[0],
            dataPoints: sampleData.length
          };
        }
      } catch (error) {
        console.log(`Could not fetch sample data for ${variable.fredTicker}`);
      }

      return null;
    } catch (error) {
      console.error(`Error checking data availability for ${variable.fredTicker}:`, error);
      return null;
    }
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
