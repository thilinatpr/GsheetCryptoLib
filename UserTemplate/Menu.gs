/**
 * Create menu when sheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('📊 Crypto Prices')
    .addItem('💰 Fetch Prices', 'fetchPrices')
    .addItem('📝 Setup Sample Data', 'setupSampleData')
    .addSeparator()
    .addItem('📊 Check My Usage', 'checkMyUsage')
    .addItem('🔌 Test Connection', 'testLibraryConnection')
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