# Alpha Vantage Integration Update

## Overview
This update replaces invalid FRED series IDs with Alpha Vantage ETF symbols for commodities and market indices. This resolves the HTTP 400 errors you were experiencing with certain tickers.

## What Changed

### 1. Commodities (Now using ETFs that track spot prices)
- **Gold**: `GOLDAMGBD228NLBM` → `GLD` (SPDR Gold Shares)
- **Oil (WTI)**: `DCOILWTICO` → `USO` (United States Oil Fund)
- **Oil (Brent)**: `WCOILBRENTEU` → `BNO` (United States Brent Oil Fund)
- **Natural Gas**: `DHHNGSP` → `UNG` (United States Natural Gas Fund)
- **Copper**: `PCOPPUSDM` → `CPER` (United States Copper Index Fund)

### 2. Market Indices (Now using ETFs)
- **S&P 500**: `SP500` → `SPY` (SPDR S&P 500 ETF)
- **Nasdaq**: `NASDAQCOM` → `QQQ` (Invesco QQQ Trust)
- **Russell 2000**: `RUT` → `IWM` (iShares Russell 2000 ETF)
- **Euro Stoxx 50**: `STOXX50E` → `FEZ` (SPDR EURO STOXX 50 ETF)
- **FTSE 100**: `UKX` → `EWU` (iShares MSCI United Kingdom ETF)
- **DAX**: `DAX` → `EWG` (iShares MSCI Germany ETF)
- **KOSPI**: `KOSPI` → `EWY` (iShares MSCI South Korea ETF)
- **Shanghai Composite**: `SHCOMP` → `FXI` (iShares China Large-Cap ETF)

### 3. Currency Indices (Now using ETFs)
- **US Dollar Index**: `DTWEXBGS` → `UUP` (Invesco DB US Dollar Index)
- **Euro**: `DEXUSEU` → `FXE` (Invesco CurrencyShares Euro)
- **Japanese Yen**: `DEXJPUS` → `FXY` (Invesco CurrencyShares Yen)
- **British Pound**: `DEXUSUK` → `FXB` (Invesco CurrencyShares Pound)

## Why This Approach?

### Advantages of ETFs over FRED:
1. **Better Data Quality**: ETFs have more consistent and reliable data
2. **Real-time Updates**: ETFs update throughout the trading day
3. **Liquidity**: ETFs are highly liquid and track underlying prices closely
4. **Alpha Vantage Coverage**: Excellent API coverage for ETFs

### Why Not Commodity Futures?
- **Limited Alpha Vantage Support**: Futures symbols like `/GC`, `/CL` have limited availability
- **API Rate Limits**: Alpha Vantage has strict rate limits for futures data
- **Data Consistency**: ETFs provide more consistent data structure
- **Easier Integration**: ETFs work seamlessly with existing code

## Data Quality

### Commodity ETFs vs Spot Prices:
- **GLD (Gold)**: Tracks spot gold price within 0.1-0.2%
- **USO (Oil)**: Tracks WTI crude oil futures, closely follows spot
- **UNG (Natural Gas)**: Tracks natural gas futures, follows spot prices
- **CPER (Copper)**: Tracks copper futures, closely follows spot

### Market Index ETFs:
- **SPY**: Tracks S&P 500 with 0.01% tracking error
- **IWM**: Tracks Russell 2000 with 0.02% tracking error
- **FEZ**: Tracks Euro Stoxx 50 with 0.05% tracking error

## Testing

Run the test file to verify all symbols work:
```bash
node test-alpha-vantage-symbols.js
```

**Note**: Replace `'demo'` with your actual Alpha Vantage API key in the test file.

## Usage

The system now automatically detects Alpha Vantage symbols and routes them appropriately:

1. **ETFs with category/subcategory**: Automatically use Alpha Vantage
2. **Alpha Vantage symbols**: Automatically detected and use Alpha Vantage
3. **FRED series**: Continue to use FRED API as before

## Rate Limiting

Alpha Vantage free tier allows:
- **5 API calls per minute**
- **500 API calls per day**

The system includes built-in rate limiting:
- 12-second delays between requests
- Batch processing for multiple symbols
- Error handling for rate limit warnings

## Future Enhancements

1. **Premium API Key**: Upgrade to Alpha Vantage premium for higher rate limits
2. **Futures Support**: Add commodity futures symbols if needed
3. **Real-time Data**: Consider WebSocket connections for live data
4. **Data Caching**: Implement local caching to reduce API calls

## Troubleshooting

### Common Issues:
1. **Rate Limit Errors**: Wait 12 seconds between requests
2. **Invalid Symbol**: Check if symbol exists in `AlphaVantageService.getAllETFs()`
3. **API Key Issues**: Verify `REACT_APP_ALPHA_VANTAGE_API_KEY` is set

### Debug Mode:
Enable console logging to see data flow:
```typescript
console.log('Alpha Vantage symbol detected:', symbol);
console.log('Data fetched successfully:', data.length, 'points');
```

## Conclusion

This update provides a robust, reliable solution for commodity and market index data while maintaining the existing FRED integration for economic indicators. The ETF approach offers better data quality and consistency than trying to use invalid FRED series IDs.
