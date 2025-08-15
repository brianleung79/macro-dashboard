import axios from 'axios';

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

export interface ETFData {
  symbol: string;
  name: string;
  category: 'factor' | 'sector' | 'commodity' | 'bond';
  subcategory: string;
  description: string;
}

export interface TimeSeriesData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
}

export class AlphaVantageService {
  // Factor ETFs for analysis
  static readonly FACTOR_ETFS: ETFData[] = [
    // Value Factors
    { symbol: 'VTV', name: 'Vanguard Value ETF', category: 'factor', subcategory: 'value', description: 'Large-cap value stocks' },
    { symbol: 'IWD', name: 'iShares Russell 1000 Value ETF', category: 'factor', subcategory: 'value', description: 'Russell 1000 value stocks' },
    { symbol: 'VBR', name: 'Vanguard Small-Cap Value ETF', category: 'factor', subcategory: 'value', description: 'Small-cap value stocks' },
    
    // Growth Factors
    { symbol: 'VUG', name: 'Vanguard Growth ETF', category: 'factor', subcategory: 'growth', description: 'Large-cap growth stocks' },
    { symbol: 'IWF', name: 'iShares Russell 1000 Growth ETF', category: 'factor', subcategory: 'growth', description: 'Russell 1000 growth stocks' },
    { symbol: 'VBK', name: 'Vanguard Small-Cap Growth ETF', category: 'factor', subcategory: 'growth', description: 'Small-cap growth stocks' },
    
    // Momentum Factors
    { symbol: 'MTUM', name: 'iShares MSCI USA Momentum Factor ETF', category: 'factor', subcategory: 'momentum', description: 'Momentum factor strategy' },
    { symbol: 'PDP', name: 'Invesco DWA Momentum ETF', category: 'factor', subcategory: 'momentum', description: 'Dorsey Wright momentum' },
    
    // Low Volatility
    { symbol: 'USMV', name: 'iShares MSCI USA Min Vol Factor ETF', category: 'factor', subcategory: 'low-vol', description: 'Minimum volatility strategy' },
    { symbol: 'SPLV', name: 'Invesco S&P 500 Low Volatility ETF', category: 'factor', subcategory: 'low-vol', description: 'S&P 500 low volatility' },
    
    // Quality Factors
    { symbol: 'QUAL', name: 'iShares MSCI USA Quality Factor ETF', category: 'factor', subcategory: 'quality', description: 'Quality factor strategy' },
    { symbol: 'VIG', name: 'Vanguard Dividend Appreciation ETF', category: 'factor', subcategory: 'quality', description: 'Dividend growth strategy' }
  ];

  // Sector ETFs for rotation analysis
  static readonly SECTOR_ETFS: ETFData[] = [
    { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', category: 'sector', subcategory: 'technology', description: 'Technology sector' },
    { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', category: 'sector', subcategory: 'financials', description: 'Financial sector' },
    { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', category: 'sector', subcategory: 'energy', description: 'Energy sector' },
    { symbol: 'XLV', name: 'Health Care Select Sector SPDR Fund', category: 'sector', subcategory: 'healthcare', description: 'Healthcare sector' },
    { symbol: 'XLI', name: 'Industrial Select Sector SPDR Fund', category: 'sector', subcategory: 'industrials', description: 'Industrial sector' },
    { symbol: 'XLP', name: 'Consumer Staples Select Sector SPDR Fund', category: 'sector', subcategory: 'consumer-staples', description: 'Consumer staples' },
    { symbol: 'XLY', name: 'Consumer Discretionary Select Sector SPDR Fund', category: 'sector', subcategory: 'consumer-discretionary', description: 'Consumer discretionary' },
    { symbol: 'XLU', name: 'Utilities Select Sector SPDR Fund', category: 'sector', subcategory: 'utilities', description: 'Utilities sector' },
    { symbol: 'XLB', name: 'Materials Select Sector SPDR Fund', category: 'sector', subcategory: 'materials', description: 'Materials sector' }
  ];

  // Get all available ETFs
  static getAllETFs(): ETFData[] {
    return [...this.FACTOR_ETFS, ...this.SECTOR_ETFS];
  }

  // Get ETFs by category
  static getETFsByCategory(category: 'factor' | 'sector'): ETFData[] {
    return this.getAllETFs().filter(etf => etf.category === category);
  }

  // Get ETFs by subcategory
  static getETFsBySubcategory(subcategory: string): ETFData[] {
    return this.getAllETFs().filter(etf => etf.subcategory === subcategory);
  }

  // Fetch daily time series data for an ETF
  static async fetchDailyData(symbol: string, outputsize: 'compact' | 'full' = 'compact'): Promise<TimeSeriesData[]> {
    try {
      if (!ALPHA_VANTAGE_API_KEY) {
        throw new Error('Alpha Vantage API key not configured. Please set REACT_APP_ALPHA_VANTAGE_API_KEY environment variable.');
      }
      
      console.log(`=== Fetching Alpha Vantage data for ${symbol} ===`);
      
      const url = `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputsize}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      
      const response = await axios.get(url);
      
      if (response.data['Error Message']) {
        throw new Error(`Alpha Vantage error: ${response.data['Error Message']}`);
      }
      
      if (response.data['Note']) {
        console.warn('Alpha Vantage rate limit warning:', response.data['Note']);
      }
      
      const timeSeriesData = response.data['Time Series (Daily)'];
      if (!timeSeriesData) {
        throw new Error('No time series data received');
      }
      
      const data: TimeSeriesData[] = Object.entries(timeSeriesData)
        .map(([date, values]: [string, any]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
          symbol
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log(`Successfully fetched ${data.length} data points for ${symbol}`);
      return data;
      
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      throw error;
    }
  }

  // Fetch multiple ETFs data
  static async fetchMultipleETFs(symbols: string[]): Promise<{ [symbol: string]: TimeSeriesData[] }> {
    const results: { [symbol: string]: TimeSeriesData[] } = {};
    
    // Process in batches to respect rate limits
    const batchSize = 5; // Alpha Vantage allows 5 calls per minute on free tier
    
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (symbol) => {
        try {
          const data = await this.fetchDailyData(symbol);
          results[symbol] = data;
        } catch (error) {
          console.error(`Failed to fetch ${symbol}:`, error);
          results[symbol] = [];
        }
      });
      
      await Promise.all(batchPromises);
      
      // Rate limiting: wait 12 seconds between batches (5 calls per minute = 12 second intervals)
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 12000));
      }
    }
    
    return results;
  }

  // Calculate returns for performance analysis
  static calculateReturns(data: TimeSeriesData[]): { date: string; return: number }[] {
    if (data.length < 2) return [];
    
    const returns: { date: string; return: number }[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const previousClose = data[i - 1].close;
      const currentClose = data[i].close;
      const dailyReturn = ((currentClose - previousClose) / previousClose) * 100;
      
      returns.push({
        date: data[i].date,
        return: dailyReturn
      });
    }
    
    return returns;
  }

  // Calculate rolling volatility
  static calculateRollingVolatility(data: TimeSeriesData[], window: number = 20): { date: string; volatility: number }[] {
    if (data.length < window) return [];
    
    const volatility: { date: string; volatility: number }[] = [];
    const returns = this.calculateReturns(data);
    
    for (let i = window - 1; i < returns.length; i++) {
      const windowReturns = returns.slice(i - window + 1, i + 1);
      const meanReturn = windowReturns.reduce((sum, r) => sum + r.return, 0) / window;
      const variance = windowReturns.reduce((sum, r) => sum + Math.pow(r.return - meanReturn, 2), 0) / window;
      const stdDev = Math.sqrt(variance);
      
      volatility.push({
        date: returns[i].date,
        volatility: stdDev
      });
    }
    
    return volatility;
  }
}
