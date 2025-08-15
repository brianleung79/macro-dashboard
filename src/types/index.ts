export interface MacroVariable {
  series: string;
  fredTicker: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  series: string;
}

export interface ChartData {
  x: string[];
  y: number[];
  name: string;
  type: 'scatter' | 'bar' | 'line';
  mode?: 'lines' | 'markers' | 'lines+markers';
  line?: {
    color?: string;
    width?: number;
  };
  marker?: {
    color?: string;
    size?: number;
  };
  hovertemplate?: string;
}

export interface ChartConfig {
  title: string;
  xaxis: {
    title: string;
    type?: string;
  };
  yaxis: {
    title: string;
    type?: string;
  };
  showlegend: boolean;
  height?: number;
  margin?: {
    l: number;
    r: number;
    t: number;
    b: number;
  };
}

export interface FREDResponse {
  observations: Array<{
    realtime_start: string;
    realtime_end: string;
    date: string;
    value: string;
  }>;
}

// New types for the 5-chart dashboard
export interface ChartTimeframe {
  startDate: string;
  endDate: string;
}

export interface Chart1Config {
  variables: MacroVariable[];
  timeframe: ChartTimeframe;
}

export interface Chart2Config {
  variable1?: MacroVariable;
  variable2?: MacroVariable;
  plotType: 'ratio' | 'spread';
  timeframe: ChartTimeframe;
}

export interface Chart3Config {
  variable1?: MacroVariable;
  variable2?: MacroVariable;
  plotType: 'ratio' | 'spread';
  timeframe: ChartTimeframe;
}

export interface Chart4Config {
  variablePairs: Array<{ var1: MacroVariable; var2: MacroVariable }>;
  timeframe: ChartTimeframe;
}

export interface Chart5Config {
  variables: MacroVariable[];
  timeframe: ChartTimeframe;
}

export interface DashboardConfig {
  chart1: Chart1Config;
  chart2: Chart2Config;
  chart3: Chart3Config;
  chart4: Chart4Config;
  chart5: Chart5Config;
}
