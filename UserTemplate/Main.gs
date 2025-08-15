/**
 * Fetch prices using the secure backend library
 */
function fetchPrices() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const spreadsheetId = ss.getId();
    
    // Check configuration first
    if (!USER_CONFIG.LIBRARY_IDENTIFIER) {
      throw new Error('LIBRARY_IDENTIFIER not configured in USER_CONFIG. Please set it in Config.gs');
    }
    
    const libId = USER_CONFIG.LIBRARY_IDENTIFIER;
    
    // Check if library is available
    try {
      if (typeof eval(libId) === 'undefined') {
        throw new Error(`Library '${libId}' not found. Please add the library to this project first.`);
      }
      
      // Call backend library function to handle everything
      const result = eval(`${libId}.fetchPricesForSheet(spreadsheetId, USER_CONFIG.DATA_SHEET, USER_CONFIG.PRICES_SHEET, USER_CONFIG.CURRENCY)`);
      
      // Check for errors
      if (result.error) {
        throw new Error(result.error);
      }
      
      SpreadsheetApp.getUi().alert(
        'Success',
        `✅ ${result.message}`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      
    } catch (evalError) {
      throw new Error(`Library error: ${evalError.message}. Make sure the library is properly added with identifier '${libId}'.`);
    }
    
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
 * Check usage limits
 */
function checkMyUsage() {
  try {
    // Check configuration first
    if (!USER_CONFIG.LIBRARY_IDENTIFIER) {
      throw new Error('LIBRARY_IDENTIFIER not configured in USER_CONFIG. Please set it in Config.gs');
    }
    
    const libId = USER_CONFIG.LIBRARY_IDENTIFIER;
    
    // Check if library is available
    if (typeof eval(libId) === 'undefined') {
      throw new Error(`Library '${libId}' not found. Please add the library to this project first.`);
    }
    
    const usage = eval(`${libId}.getMyUsage()`);
    
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
 * DEBUG: Check user access status
 */
function debugUserAccess() {
  try {
    // Check configuration first
    if (!USER_CONFIG.LIBRARY_IDENTIFIER) {
      throw new Error('LIBRARY_IDENTIFIER not configured in USER_CONFIG. Please set it in Config.gs');
    }
    
    const libId = USER_CONFIG.LIBRARY_IDENTIFIER;
    
    // Check if library is available
    if (typeof eval(libId) === 'undefined') {
      throw new Error(`Library '${libId}' not found. Please add the library to this project first.`);
    }
    
    const result = eval(`${libId}.debugUserAccess()`);
    
    SpreadsheetApp.getUi().alert(
      'Debug User Access',
      JSON.stringify(result, null, 2),
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
    // Check configuration first
    if (!USER_CONFIG.LIBRARY_IDENTIFIER) {
      throw new Error('LIBRARY_IDENTIFIER not configured in USER_CONFIG. Please set it in Config.gs');
    }
    
    const libId = USER_CONFIG.LIBRARY_IDENTIFIER;
    
    // Check if library is available
    if (typeof eval(libId) === 'undefined') {
      throw new Error(`Library '${libId}' not found. Please add the library to this project first.`);
    }
    
    const result = eval(`${libId}.testConnection()`);
    
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