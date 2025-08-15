/**
 * Simple test script for using the crypto library
 * Copy this to a NEW Google Apps Script project after adding the library
 */

// Replace with your actual library identifier
const LIBRARY_ID = 'CryptoLib'; // This is what you name it when adding the library

/**
 * Test basic library functions
 */
function testCryptoLibrary() {
  console.log('Testing Crypto Library...');
  
  try {
    // Test 1: Connection
    console.log('\n=== Testing Connection ===');
    const connectionTest = CryptoLib.testConnection();
    console.log('Connection result:', connectionTest);
    
    // Test 2: Get supported networks
    console.log('\n=== Testing Supported Networks ===');
    const networks = CryptoLib.getSupportedNetworks();
    console.log('Networks:', networks);
    
    // Test 3: Simple price fetch
    console.log('\n=== Testing Price Fetch ===');
    const prices = CryptoLib.fetchCryptoPrices(['bitcoin'], 'usd');
    console.log('Bitcoin price:', prices);
    
    // Test 4: Multiple coins
    console.log('\n=== Testing Multiple Coins ===');
    const multiPrices = CryptoLib.fetchCryptoPrices(['bitcoin', 'ethereum', 'cardano'], 'usd');
    console.log('Multiple prices:', multiPrices);
    
    // Test 5: Usage stats
    console.log('\n=== Testing Usage Stats ===');
    const usage = CryptoLib.getMyUsage();
    console.log('Usage stats:', usage);
    
    console.log('\n=== All Tests Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

/**
 * Simple function to update a Google Sheet with crypto prices
 */
function updateSheetWithPrices() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  try {
    // Clear previous data
    sheet.clear();
    
    // Headers
    sheet.getRange('A1').setValue('Cryptocurrency');
    sheet.getRange('B1').setValue('Price (USD)');
    sheet.getRange('C1').setValue('Last Updated');
    
    // Get prices
    const tokens = ['bitcoin', 'ethereum', 'cardano', 'solana'];
    const result = CryptoLib.fetchCryptoPrices(tokens, 'usd');
    
    if (result.error) {
      sheet.getRange('A2').setValue('Error: ' + result.error);
      return;
    }
    
    // Write data to sheet
    let row = 2;
    for (const token of tokens) {
      if (result.data && result.data[token]) {
        sheet.getRange(`A${row}`).setValue(token.charAt(0).toUpperCase() + token.slice(1));
        sheet.getRange(`B${row}`).setValue(`$${result.data[token].usd}`);
        sheet.getRange(`C${row}`).setValue(new Date());
        row++;
      }
    }
    
    console.log('Sheet updated successfully');
    
  } catch (error) {
    console.error('Sheet update failed:', error);
    sheet.getRange('A2').setValue('Error: ' + error.message);
  }
}

/**
 * Check your API usage
 */
function checkMyUsage() {
  try {
    const usage = CryptoLib.getMyUsage();
    console.log('Your API Usage:', usage);
    
    // You can also display this in a sheet
    const sheet = SpreadsheetApp.getActiveSheet();
    sheet.getRange('E1').setValue('API Usage');
    sheet.getRange('E2').setValue(`Hourly: ${usage.hourly.used}/${usage.hourly.limit}`);
    sheet.getRange('E3').setValue(`Daily: ${usage.daily.used}/${usage.daily.limit}`);
    
  } catch (error) {
    console.error('Usage check failed:', error);
  }
}

/**
 * Test access control functionality
 * This will help verify the bug fix for missing emails
 */
function testAccessControl() {
  console.log('Testing Access Control...');
  
  try {
    // Test debugUserAccess to see current user status
    console.log('\n=== Debug User Access ===');
    const debugInfo = CryptoLib.debugUserAccess();
    console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
    
    // Test fetchCryptoPrices to see if access is properly controlled
    console.log('\n=== Testing Access to fetchCryptoPrices ===');
    const priceResult = CryptoLib.fetchCryptoPrices(['bitcoin'], 'usd');
    console.log('Price fetch result:', JSON.stringify(priceResult, null, 2));
    
    // Analyze results
    if (debugInfo.accessMode) {
      console.log(`\n=== Analysis ===`);
      console.log(`Access mode: ${debugInfo.accessMode}`);
      console.log(`User email: ${debugInfo.userEmail}`);
      console.log(`Is blocked: ${debugInfo.isBlocked}`);
      console.log(`In allowed list: ${debugInfo.allowedUsers.includes(debugInfo.userEmail)}`);
      
      if (debugInfo.accessMode === 'EMAIL_WHITELIST') {
        if (!debugInfo.allowedUsers.includes(debugInfo.userEmail)) {
          console.log('✓ CORRECT: User should be denied access (not in whitelist)');
          if (priceResult.error && priceResult.status === 'access_denied') {
            console.log('✓ ACCESS CONTROL WORKING: Price fetch correctly denied');
          } else {
            console.log('✗ BUG: Price fetch should have been denied but wasn\'t');
          }
        } else {
          console.log('✓ CORRECT: User should be allowed access (in whitelist)');
        }
      } else if (debugInfo.accessMode === 'OPEN') {
        if (!debugInfo.isBlocked) {
          console.log('✓ CORRECT: User should be allowed access (OPEN mode, not blocked)');
        } else {
          console.log('✓ CORRECT: User should be denied access (blocked)');
        }
      }
    }
    
  } catch (error) {
    console.error('Access control test failed:', error);
  }
}