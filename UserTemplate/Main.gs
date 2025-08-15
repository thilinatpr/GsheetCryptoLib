/**
 * Fetch prices using the secure library
 * Users cannot see or access the API key
 */
function fetchPrices() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = ss.getSheetByName(USER_CONFIG.DATA_SHEET);
    const pricesSheet = ss.getSheetByName(USER_CONFIG.PRICES_SHEET) || ss.insertSheet(USER_CONFIG.PRICES_SHEET);
    
    if (!dataSheet) {
      throw new Error(`Data sheet "${USER_CONFIG.DATA_SHEET}" not found.`);
    }
    
    // Get token data from sheet
    const tokenData = getTokenData(dataSheet);
    if (tokenData.length === 0) {
      throw new Error("No valid token data found.");
    }
    
    console.log(`Processing ${tokenData.length} tokens...`);
    
    // Call the secure library function
    // The API key is handled internally by the library
    const priceData = CryptoAPILibrary.fetchCryptoPrices(tokenData, USER_CONFIG.CURRENCY);
    
    // Check for errors
    if (priceData.error) {
      throw new Error(priceData.error);
    }
    
    // Display results
    displayPrices(pricesSheet, priceData, tokenData);
    
    SpreadsheetApp.getUi().alert(
      'Success',
      `✅ Prices updated successfully!`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    console.error('Error:', error);
    SpreadsheetApp.getUi().alert(
      'Error',
      `❌ Failed to fetch prices: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Get token data from sheet
 */
function getTokenData(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const tokens = [];
  for (let i = 1; i < data.length; i++) {
    const [coinId, symbol, name] = data[i];
    
    if (coinId && coinId.toString().trim()) {
      tokens.push({
        coinId: coinId.toString().trim().toLowerCase(),
        symbol: (symbol || 'TOKEN').toString().trim().toUpperCase(),
        name: (name || symbol || 'Unknown').toString().trim()
      });
    }
  }
  
  return tokens;
}

/**
 * Display prices in sheet
 */
function displayPrices(sheet, priceData, originalTokens) {
  sheet.clear();
  
  // Headers
  const headers = ['Coin ID', 'Symbol', 'Name', 'Price (USD)', '24h Change (%)'];
  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight('bold')
    .setBackground('#1a73e8')
    .setFontColor('white');
  
  // Data rows
  const rows = [];
  Object.entries(priceData).forEach(([coinId, info]) => {
    if (info && info.current_price !== undefined) {
      rows.push([
        coinId,
        info.symbol,
        info.name,
        info.current_price,
        info.price_change_percentage_24h
      ]);
    }
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    
    // Format price column
    sheet.getRange(2, 4, rows.length, 1).setNumberFormat('$#,##0.00000');
    
    // Format percentage column
    sheet.getRange(2, 5, rows.length, 1).setNumberFormat('0.00%');
  }
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  // Add timestamp
  sheet.getRange(rows.length + 3, 1)
    .setValue(`Last updated: ${new Date().toLocaleString()}`);
}

/**
 * Check usage limits
 */
function checkMyUsage() {
  try {
    const usage = CryptoAPILibrary.getMyUsage();
    
    if (usage.error) {
      throw new Error(usage.error);
    }
    
    SpreadsheetApp.getUi().alert(
      'Usage Statistics',
      `Hourly: ${usage.hourly}/${usage.limits.maxRequestsPerHour}\n` +
      `Daily: ${usage.daily}/${usage.limits.maxRequestsPerDay}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Test library connection
 */
function testLibraryConnection() {
  try {
    const result = CryptoAPILibrary.testConnection();
    
    SpreadsheetApp.getUi().alert(
      'Library Connection',
      `Status: ${result.status}\n` +
      `Version: ${result.version}\n` +
      `User: ${result.user}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}