/**
 * Create menu when sheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('📊 Crypto Prices')
    .addItem('💰 Fetch Prices', 'fetchPrices')
    .addItem('📝 Setup Sample Data', 'setupSampleData')
    .addSeparator()
    .addItem('🌐 Get Supported Networks', 'getSupportedNetworksMenu')
    .addItem('🪙 Get Available Coins', 'getAvailableCoins')
    .addSeparator()
    .addItem('📊 Check My Usage', 'checkMyUsage')
    .addItem('🔌 Test Connection', 'testLibraryConnection')
    .addSeparator()
    .addItem('🐛 Debug User Access', 'debugUserAccess')
    .addItem('⚙️ Show Configuration', 'showConfiguration')
    .addToUi();
}

/**
 * Setup sample token data
 */
function setupSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dataSheet = ss.getSheetByName(USER_CONFIG.DATA_SHEET);
  
  if (!dataSheet) {
    dataSheet = ss.insertSheet(USER_CONFIG.DATA_SHEET);
  } else {
    dataSheet.clear();
  }
  
  const sampleData = [
    ['Coin ID', 'Symbol', 'Name'],
    ['bitcoin', 'BTC', 'Bitcoin'],
    ['ethereum', 'ETH', 'Ethereum'],
    ['cardano', 'ADA', 'Cardano'],
    ['solana', 'SOL', 'Solana'],
    ['polkadot', 'DOT', 'Polkadot']
  ];
  
  dataSheet.getRange(1, 1, sampleData.length, 3).setValues(sampleData);
  
  // Format headers
  dataSheet.getRange(1, 1, 1, 3)
    .setFontWeight('bold')
    .setBackground('#1a73e8')
    .setFontColor('white');
  
  dataSheet.autoResizeColumns(1, 3);
  
  SpreadsheetApp.getUi().alert(
    'Success',
    '✅ Sample data created successfully!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Get supported networks and display in sheet
 */
function getSupportedNetworksMenu() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const spreadsheetId = ss.getId();
    
    // Check configuration first
    if (!USER_CONFIG.LIBRARY_IDENTIFIER) {
      throw new Error('LIBRARY_IDENTIFIER not configured in USER_CONFIG. Please set it in Config.gs');
    }
    
    const libId = USER_CONFIG.LIBRARY_IDENTIFIER;
    
    // Check if library is available
    if (typeof eval(libId) === 'undefined') {
      throw new Error(`Library '${libId}' not found. Please add the library to this project first.`);
    }
    
    // Call backend to handle everything
    const result = eval(`${libId}.getNetworksForSheet(spreadsheetId, USER_CONFIG.NETWORKS_SHEET)`);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    SpreadsheetApp.getUi().alert(
      'Success',
      `✅ ${result.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Get available coins and display in sheet
 */
function getAvailableCoins() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const spreadsheetId = ss.getId();
    
    // Check configuration first
    if (!USER_CONFIG.LIBRARY_IDENTIFIER) {
      throw new Error('LIBRARY_IDENTIFIER not configured in USER_CONFIG. Please set it in Config.gs');
    }
    
    const libId = USER_CONFIG.LIBRARY_IDENTIFIER;
    
    // Check if library is available
    if (typeof eval(libId) === 'undefined') {
      throw new Error(`Library '${libId}' not found. Please add the library to this project first.`);
    }
    
    // Call backend to handle everything
    const result = eval(`${libId}.getCoinsForSheet(spreadsheetId, USER_CONFIG.COINS_SHEET, 50)`);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    SpreadsheetApp.getUi().alert(
      'Success',
      `✅ ${result.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Show current configuration
 */
function showConfiguration() {
  try {
    // Check if USER_CONFIG is loaded
    if (typeof USER_CONFIG === 'undefined') {
      throw new Error('USER_CONFIG not loaded. Make sure Config.gs is included in your project.');
    }
    
    const config = {
      libraryIdentifier: USER_CONFIG.LIBRARY_IDENTIFIER,
      currency: USER_CONFIG.CURRENCY,
      dataSheet: USER_CONFIG.DATA_SHEET,
      pricesSheet: USER_CONFIG.PRICES_SHEET,
      networksSheet: USER_CONFIG.NETWORKS_SHEET,
      coinsSheet: USER_CONFIG.COINS_SHEET
    };
    
    let message = 'Current Configuration:\n\n';
    message += `Library Identifier: ${config.libraryIdentifier}\n`;
    message += `Currency: ${config.currency}\n`;
    message += `Data Sheet: ${config.dataSheet}\n`;
    message += `Prices Sheet: ${config.pricesSheet}\n`;
    message += `Networks Sheet: ${config.networksSheet}\n`;
    message += `Coins Sheet: ${config.coinsSheet}\n\n`;
    
    // Check if library is available
    if (config.libraryIdentifier) {
      try {
        const libAvailable = typeof eval(config.libraryIdentifier) !== 'undefined';
        message += `Library Available: ${libAvailable ? '✅ Yes' : '❌ No'}\n`;
      } catch (e) {
        message += `Library Available: ❌ No (${e.message})\n`;
      }
    }
    
    SpreadsheetApp.getUi().alert(
      'Configuration',
      message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}