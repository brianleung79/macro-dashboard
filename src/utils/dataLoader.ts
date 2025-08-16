import { MacroVariable } from '../types';
import { AlphaVantageService } from '../services/alphaVantageService';

export class DataLoader {
  static async loadMacroVariables(): Promise<MacroVariable[]> {
    try {
      console.log('=== Loading Macro Variables from CSV ===');
      const response = await fetch('/FRED_DATA.csv');
      console.log('CSV fetch response status:', response.status);
      console.log('CSV fetch response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log('CSV text length:', csvText.length);
      console.log('CSV first 200 chars:', csvText.substring(0, 200));
      
      // Parse CSV
      const lines = csvText.split('\n');
      console.log('Total CSV lines:', lines.length);
      
      const variables: MacroVariable[] = [];
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          // Handle quoted fields properly
          let series = '';
          let fredTicker = '';
          
          if (line.startsWith('"')) {
            // Find the end of the quoted series name
            const endQuoteIndex = line.indexOf('",', 1);
            if (endQuoteIndex !== -1) {
              series = line.substring(1, endQuoteIndex).trim();
              fredTicker = line.substring(endQuoteIndex + 2).trim();
            }
          } else {
            // Simple comma split for non-quoted lines
            const [seriesPart, tickerPart] = line.split(',');
            series = seriesPart?.trim() || '';
            fredTicker = tickerPart?.trim() || '';
          }
          
          if (series && fredTicker) {
            variables.push({
              series: series,
              fredTicker: fredTicker
            });
          }
        }
      }
      
      console.log('Parsed variables count:', variables.length);
      console.log('Sample variables:', variables.slice(0, 3));
      
      return variables;
    } catch (error) {
      console.error('Error loading macro variables:', error);
      throw error;
    }
  }

  static loadETFFactors(): MacroVariable[] {
    console.log('=== Loading ETF Factors ===');
    const etfFactors = AlphaVantageService.getAllETFs();
    console.log('ETF factors found:', etfFactors.length);
    console.log('Sample ETF factors:', etfFactors.slice(0, 3));
    
    const result = etfFactors.map(etf => ({
      series: `${etf.name} (${etf.symbol})`,
      fredTicker: etf.symbol,
      category: etf.category,
      subcategory: etf.subcategory,
      description: etf.description
    }));
    
    console.log('Converted ETF variables:', result.length);
    return result;
  }

  static async loadAllVariables(): Promise<MacroVariable[]> {
    console.log('=== Loading All Variables ===');
    const macroVariables = await this.loadMacroVariables();
    console.log('Macro variables loaded:', macroVariables.length);
    
    const etfFactors = this.loadETFFactors();
    console.log('ETF factors loaded:', etfFactors.length);
    
    const allVariables = [...macroVariables, ...etfFactors];
    console.log('Total variables:', allVariables.length);
    console.log('Sample of all variables:', allVariables.slice(0, 5));
    
    // Show category breakdown
    const categories = this.groupVariablesByCategory(allVariables);
    console.log('=== Category Breakdown ===');
    Object.entries(categories).forEach(([category, variables]) => {
      console.log(`${category}: ${variables.length} variables`);
    });
    console.log('=== Deployment forced ===');
    
    return allVariables;
  }

  static groupVariablesByCategory(variables: MacroVariable[]): Record<string, MacroVariable[]> {
    const categories: Record<string, MacroVariable[]> = {
      'Interest Rates & Yields': [],
      'Inflation': [],
      'Economic Activity': [],
      'Employment': [],
      'Housing': [],
      'Financial Markets': [],
      'Currency': [],
      'Commodities': [],
      'Credit & Stress': [],
      'Equity Factors': []
    };

    variables.forEach(variable => {
      const series = variable.series.toLowerCase();
      
      if (series.includes('rate') || series.includes('yield') || series.includes('fed funds') || series.includes('t-bill')) {
        categories['Interest Rates & Yields'].push(variable);
      } else if (series.includes('cpi') || series.includes('pce') || series.includes('ppi') || series.includes('inflation')) {
        categories['Inflation'].push(variable);
      } else if (series.includes('gdp') || series.includes('consumption') || series.includes('production') || series.includes('retail')) {
        categories['Economic Activity'].push(variable);
      } else if (series.includes('employment') || series.includes('payroll') || series.includes('unemployment') || series.includes('job')) {
        categories['Employment'].push(variable);
      } else if (series.includes('housing') || series.includes('building') || series.includes('case-shiller')) {
        categories['Housing'].push(variable);
      } else if (series.includes('s&p') || series.includes('nasdaq') || series.includes('vix')) {
        categories['Financial Markets'].push(variable);
      } else if (series.includes('dollar') || series.includes('eur') || series.includes('jpy') || series.includes('gbp') || series.includes('aud') || series.includes('mxn') || series.includes('cny') || series.includes('cad')) {
        categories['Currency'].push(variable);
      } else if (series.includes('oil') || series.includes('gold') || series.includes('gas') || series.includes('copper')) {
        categories['Commodities'].push(variable);
      } else if (series.includes('corporate') || series.includes('stress') || series.includes('spread')) {
        categories['Credit & Stress'].push(variable);
      } else if (variable.category === 'factor' || variable.category === 'sector') {
        // All ETFs go to Equity Factors category
        categories['Equity Factors'].push(variable);
      } else if (series.includes('ppi') && series.includes('all commodities')) {
        // Skip PPI All Commodities - do nothing
      } else if (series.includes('real personal consumption expenditures')) {
        categories['Economic Activity'].push(variable);
      } else if (series.includes('advanced retail sales')) {
        categories['Economic Activity'].push(variable);
      } else if (series.includes('nonfarm payrolls')) {
        categories['Economic Activity'].push(variable);
      } else {
        // Default category for uncategorized items
        if (!categories['Economic Activity']) {
          categories['Economic Activity'] = [];
        }
        categories['Economic Activity'].push(variable);
      }
    });

    // Remove empty categories
    Object.keys(categories).forEach(key => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });

    return categories;
  }
}

