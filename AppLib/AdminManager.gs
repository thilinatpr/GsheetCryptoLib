/**
 * Admin Management System using Google Sheets as backend
 * Manages user access, settings, and usage analytics
 * ADMIN_CONFIG is now defined in Config.gs
 */

/**
 * One-time setup function to initialize the admin system
 * Run this once after setting SHEET_ID in Config.gs
 */
function setup() {
  try {
    console.log('Setting up admin sheet system...');
    const result = initializeAdminSheet();
    console.log('Setup complete:', result);
    return result;
  } catch (error) {
    console.error('Setup failed:', error.message);
    return { error: error.message, status: 'failed' };
  }
}

/**
 * Initialize admin sheet with proper structure
 */
function initializeAdminSheet() {
  if (!ADMIN_CONFIG.SHEET_ID) {
    throw new Error('Please set ADMIN_CONFIG.SHEET_ID first');
  }
  
  const ss = SpreadsheetApp.openById(ADMIN_CONFIG.SHEET_ID);
  
  // Create Users sheet
  createUsersSheet(ss);
  
  // Create Settings sheet  
  createSettingsSheet(ss);
  
  // Create Usage sheet
  createUsageSheet(ss);
  
  // Create Logs sheet
  createLogsSheet(ss);
  
  return { status: 'success', message: 'Admin sheets initialized' };
}

/**
 * Create Users management sheet
 */
function createUsersSheet(ss) {
  let sheet = ss.getSheetByName(ADMIN_CONFIG.SHEETS.USERS);
  if (!sheet) {
    sheet = ss.insertSheet(ADMIN_CONFIG.SHEETS.USERS);
  }
  
  // Clear and set headers
  sheet.clear();
  const headers = ['Email', 'Status', 'Domain', 'Added Date', 'Last Used', 'Total Requests', 'Notes'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#4285f4')
    .setFontColor('white')
    .setFontWeight('bold');
    
  // Set column widths
  sheet.setColumnWidth(1, 200); // Email
  sheet.setColumnWidth(2, 100); // Status
  sheet.setColumnWidth(3, 150); // Domain
  sheet.setColumnWidth(4, 120); // Added Date
  sheet.setColumnWidth(5, 120); // Last Used
  sheet.setColumnWidth(6, 120); // Total Requests
  sheet.setColumnWidth(7, 300); // Notes
  
  // Add sample data
  const sampleData = [
    ['admin@example.com', 'ALLOWED', 'example.com', new Date(), '', 0, 'Admin user'],
    ['user@company.com', 'ALLOWED', 'company.com', new Date(), '', 0, 'Approved user'],
    ['blocked@spam.com', 'BLOCKED', 'spam.com', new Date(), '', 0, 'Blocked for abuse']
  ];
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
}

/**
 * Create Settings management sheet
 */
function createSettingsSheet(ss) {
  let sheet = ss.getSheetByName(ADMIN_CONFIG.SHEETS.SETTINGS);
  if (!sheet) {
    sheet = ss.insertSheet(ADMIN_CONFIG.SHEETS.SETTINGS);
  }
  
  sheet.clear();
  const headers = ['Setting', 'Value', 'Description'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#34a853')
    .setFontColor('white')
    .setFontWeight('bold');
    
  // Set column widths
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 400);
  
  // Add settings
  const settings = [
    ['ACCESS_MODE', 'EMAIL_WHITELIST', 'OPEN, EMAIL_WHITELIST, DOMAIN_WHITELIST, MIXED'],
    ['MAX_REQUESTS_PER_HOUR', '100', 'Hourly rate limit per user'],
    ['MAX_REQUESTS_PER_DAY', '1000', 'Daily rate limit per user'],
    ['ADMIN_EMAIL', 'admin@example.com', 'Administrator email address'],
    ['API_KEY', 'CG-JP3DnpxLxLYWBNjDJR1DiHpf', 'CoinGecko API key'],
    ['LOG_LEVEL', 'INFO', 'Logging level: DEBUG, INFO, WARN, ERROR'],
    ['ANALYTICS_ENABLED', 'true', 'Enable usage analytics tracking']
  ];
  sheet.getRange(2, 1, settings.length, headers.length).setValues(settings);
}

/**
 * Create Usage analytics sheet
 */
function createUsageSheet(ss) {
  let sheet = ss.getSheetByName(ADMIN_CONFIG.SHEETS.USAGE);
  if (!sheet) {
    sheet = ss.insertSheet(ADMIN_CONFIG.SHEETS.USAGE);
  }
  
  sheet.clear();
  const headers = ['Date', 'User', 'Action', 'Status', 'Response Time (ms)', 'Tokens Requested', 'IP Address'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#ff9800')
    .setFontColor('white')
    .setFontWeight('bold');
    
  // Set column widths
  sheet.setColumnWidth(1, 150); // Date
  sheet.setColumnWidth(2, 200); // User
  sheet.setColumnWidth(3, 150); // Action
  sheet.setColumnWidth(4, 100); // Status
  sheet.setColumnWidth(5, 120); // Response Time
  sheet.setColumnWidth(6, 120); // Tokens
  sheet.setColumnWidth(7, 150); // IP
}

/**
 * Create Logs sheet
 */
function createLogsSheet(ss) {
  let sheet = ss.getSheetByName(ADMIN_CONFIG.SHEETS.LOGS);
  if (!sheet) {
    sheet = ss.insertSheet(ADMIN_CONFIG.SHEETS.LOGS);
  }
  
  sheet.clear();
  const headers = ['Timestamp', 'Level', 'User', 'Message', 'Details'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#9c27b0')
    .setFontColor('white')
    .setFontWeight('bold');
    
  // Set column widths
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 80);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 300);
  sheet.setColumnWidth(5, 400);
}

/**
 * Get all allowed users from sheet
 */
function getAllowedUsersFromSheet() {
  console.log('getAllowedUsersFromSheet: Starting, SHEET_ID:', ADMIN_CONFIG.SHEET_ID);
  
  if (!ADMIN_CONFIG.SHEET_ID) {
    console.log('Admin sheet not configured, no allowed users');
    return [];
  }
  
  try {
    const ss = SpreadsheetApp.openById(ADMIN_CONFIG.SHEET_ID);
    console.log('getAllowedUsersFromSheet: Opened spreadsheet successfully');
    
    const sheet = ss.getSheetByName(ADMIN_CONFIG.SHEETS.USERS);
    if (!sheet) {
      console.log('Users sheet not found, no allowed users');
      return [];
    }
    
    console.log('getAllowedUsersFromSheet: Found Users sheet');
    const data = sheet.getDataRange().getValues();
    console.log('getAllowedUsersFromSheet: Got data, rows:', data.length);
    
    const allowedUsers = [];
    
    for (let i = 1; i < data.length; i++) { // Skip header
      const [email, status] = data[i];
      console.log('getAllowedUsersFromSheet: Checking row', i, 'email:', email, 'status:', status);
      if (status === 'ALLOWED' && email) {
        allowedUsers.push(email.toLowerCase().trim());
      }
    }
    
    console.log('getAllowedUsersFromSheet: Returning', allowedUsers.length, 'allowed users:', allowedUsers);
    return allowedUsers;
  } catch (error) {
    console.warn('Error reading allowed users, returning empty list:', error.message);
    return [];
  }
}

/**
 * Get blocked users from sheet
 */
function getBlockedUsersFromSheet() {
  if (!ADMIN_CONFIG.SHEET_ID) {
    console.log('Admin sheet not configured, no blocked users');
    return [];
  }
  
  try {
    const ss = SpreadsheetApp.openById(ADMIN_CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(ADMIN_CONFIG.SHEETS.USERS);
    if (!sheet) {
      console.log('Users sheet not found, no blocked users');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const blockedUsers = [];
    
    for (let i = 1; i < data.length; i++) { // Skip header
      const [email, status] = data[i];
      if (status === 'BLOCKED' && email) {
        blockedUsers.push(email.toLowerCase().trim());
      }
    }
    
    return blockedUsers;
  } catch (error) {
    console.warn('Error reading blocked users, returning empty list:', error.message);
    return [];
  }
}

/**
 * Get setting value from sheet
 */
function getSettingFromSheet(settingName) {
  if (!ADMIN_CONFIG.SHEET_ID) {
    console.log(`Admin sheet not configured, cannot get setting: ${settingName}`);
    return null;
  }
  
  try {
    const ss = SpreadsheetApp.openById(ADMIN_CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(ADMIN_CONFIG.SHEETS.SETTINGS);
    if (!sheet) {
      console.log(`Settings sheet not found, cannot get setting: ${settingName}`);
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) { // Skip header
      const [setting, value] = data[i];
      if (setting === settingName) {
        return value;
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`Error reading setting ${settingName}:`, error.message);
    return null;
  }
}

/**
 * Log usage to sheet
 */
function logUsageToSheet(user, action, status, responseTime, tokensRequested, ipAddress) {
  if (!ADMIN_CONFIG.SHEET_ID) return;
  
  try {
    const ss = SpreadsheetApp.openById(ADMIN_CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(ADMIN_CONFIG.SHEETS.USAGE);
    if (!sheet) return;
    
    const newRow = [
      new Date(),
      user || 'unknown',
      action || 'unknown',
      status || 'unknown',
      responseTime || 0,
      tokensRequested || 0,
      ipAddress || 'unknown'
    ];
    
    sheet.appendRow(newRow);
    
    // Keep only last 1000 rows to prevent sheet from growing too large
    const numRows = sheet.getLastRow();
    if (numRows > 1000) {
      sheet.deleteRows(2, numRows - 1000); // Keep header + 999 data rows
    }
    
  } catch (error) {
    console.error('Error logging usage:', error);
  }
}

/**
 * Log event to sheet
 */
function logToSheet(level, user, message, details) {
  if (!ADMIN_CONFIG.SHEET_ID) return;
  
  try {
    const ss = SpreadsheetApp.openById(ADMIN_CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(ADMIN_CONFIG.SHEETS.LOGS);
    if (!sheet) return;
    
    const newRow = [
      new Date(),
      level || 'INFO',
      user || 'system',
      message || '',
      details || ''
    ];
    
    sheet.appendRow(newRow);
    
    // Keep only last 500 log entries
    const numRows = sheet.getLastRow();
    if (numRows > 500) {
      sheet.deleteRows(2, numRows - 500);
    }
    
  } catch (error) {
    console.error('Error logging to sheet:', error);
  }
}