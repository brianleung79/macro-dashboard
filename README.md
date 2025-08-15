# Macro Analysis - Economic Data Explorer

A modern, sleek web application for analyzing macroeconomic variables using FRED (Federal Reserve Economic Data) API. Built with React, TypeScript, and Tailwind CSS, this app provides an intuitive interface for economic research and analysis.

## Features

### 📊 Analysis Types
- **Time Series Analysis**: Plot multiple variables over time with interactive charts
- **Rolling Correlation**: Calculate and visualize correlation between two variables over time
- **Ratio Analysis**: Create ratios between any two selected variables
- **Rolling Statistics**: Compute moving averages and standard deviations

### 🎯 Key Capabilities
- Select up to 10 macroeconomic variables from a comprehensive dataset
- Dynamic variable categorization (Interest Rates, Inflation, Economic Activity, etc.)
- Interactive date range selection with quick presets
- Configurable rolling window sizes (6, 12, 24, 36, 60 months)
- Real-time data fetching from FRED API
- Modern, responsive design optimized for research workflows

### 📈 Available Variables
The app includes 50+ macroeconomic indicators covering:
- **Interest Rates & Yields**: Fed Funds Rate, Treasury Yields, Mortgage Rates
- **Inflation**: CPI, PCE, PPI measures
- **Economic Activity**: GDP, Consumption, Industrial Production, Retail Sales
- **Employment**: Nonfarm Payrolls, Unemployment Rate, Job Openings
- **Housing**: Housing Starts, Building Permits, Case-Shiller Index
- **Financial Markets**: S&P 500, Nasdaq, VIX
- **Currency**: Dollar Index, Major Currency Pairs
- **Commodities**: Oil, Gold, Natural Gas, Copper
- **Credit & Stress**: Corporate Spreads, Financial Stress Index

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- FRED API key (free from [FRED API](https://fred.stlouisfed.org/docs/api/api_key.html))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd macro-analysis-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_FRED_API_KEY=your_fred_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production
```bash
npm run build
```

## Usage

### 1. Variable Selection
- Browse variables by category or use the search function
- Select up to 10 variables for analysis
- View selected variables in the sidebar

### 2. Analysis Configuration
- Choose analysis type (Time Series, Rolling Correlation, Ratio, Rolling Stats)
- Set date range using date pickers or quick presets
- Configure rolling window size for correlation and statistics analysis
- For ratio analysis, select numerator and denominator variables

### 3. Running Analysis
- Click "Run Analysis" to fetch data and generate charts
- View interactive plots with zoom, pan, and hover capabilities
- Download charts as images (coming soon)

## Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive styling
- **Plotly.js** for interactive data visualization
- **Lucide React** for consistent iconography
- **Axios** for API communication

### Key Components
- `VariableSelector`: Categorized variable selection with search
- `AnalysisControls`: Analysis type and parameter configuration
- `ChartDisplay`: Interactive chart rendering with Plotly
- `FREDService`: API integration and data processing utilities

### Data Flow
1. Load available variables from `FRED_DATA.csv`
2. User selects variables and configures analysis
3. Fetch data from FRED API based on configuration
4. Process data (correlations, ratios, rolling stats)
5. Convert to Plotly chart format
6. Render interactive visualization

## API Integration

The app integrates with the FRED API to fetch real-time economic data:

- **Base URL**: `https://api.stlouisfed.org/fred/series/observations`
- **Frequency**: Monthly data aggregation
- **Authentication**: API key required
- **Rate Limits**: FRED API standard limits apply

## Customization

### Adding New Variables
1. Update `FRED_DATA.csv` with new series and FRED tickers
2. Variables are automatically categorized based on naming patterns
3. No code changes required for new variables

### Styling
- Modify `tailwind.config.js` for theme customization
- Update component styles in `src/index.css`
- Customize chart appearance in `ChartDisplay.tsx`

### Analysis Types
- Add new analysis types in `AnalysisControls.tsx`
- Implement processing logic in `FREDService.ts`
- Update chart conversion functions in `ChartDisplay.tsx`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [FRED API](https://fred.stlouisfed.org/) for economic data
- [Plotly.js](https://plotly.com/javascript/) for charting capabilities
- [Tailwind CSS](https://tailwindcss.com/) for styling framework
- [Lucide](https://lucide.dev/) for beautiful icons

## Support

For questions, issues, or feature requests, please open an issue on GitHub or contact the development team.
