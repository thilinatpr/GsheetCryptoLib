/**
 * PUBLIC LIBRARY API
 * These are the only functions exposed to library users
 * Internal implementation and API keys remain hidden
 */

/**
 * Get library version
 */
function getVersion() {
	return '1.0.0';
}

/**
 * DEBUG: Check what the system sees for current user
 */
function debugUserAccess() {
	try {
		const userEmail = getSafeUserEmail();
		
		// Test sheet access directly
		let sheetTestResult = 'unknown';
		let sheetData = [];
		try {
			const ss = SpreadsheetApp.openById(ADMIN_CONFIG.SHEET_ID);
			const sheet = ss.getSheetByName(ADMIN_CONFIG.SHEETS.USERS);
			if (sheet) {
				const data = sheet.getDataRange().getValues();
				sheetTestResult = 'success';
				sheetData = data;
			} else {
				sheetTestResult = 'sheet not found';
			}
		} catch (sheetError) {
			sheetTestResult = `error: ${sheetError.message}`;
		}
		
		const freshConfig = getPrivateConfig();
		
		return {
			userEmail: userEmail,
			isBlocked: freshConfig.BLOCKED_USERS.includes(userEmail),
			blockedUsers: freshConfig.BLOCKED_USERS,
			allowedUsers: freshConfig.ALLOWED_EMAILS,
			accessMode: freshConfig.ACCESS_MODE,
			adminEmail: freshConfig.ADMIN_EMAIL,
			sheetId: ADMIN_CONFIG.SHEET_ID,
			sheetAccess: sheetTestResult,
			sheetData: sheetData,
			timestamp: new Date().toISOString()
		};
	} catch (error) {
		return {
			error: error.message,
			userEmail: 'unknown',
			timestamp: new Date().toISOString()
		};
	}
}

/**
 * Main function to fetch cryptocurrency prices
 * @param {Array} tokens - Array of token objects with coinId, symbol, name
 * @param {string} currency - Target currency (default: 'usd')
 * @return {Object} Price data
 */
function fetchCryptoPrices(tokens, currency = 'usd') {
	try {
		// Check user access first (even for library calls) - get fresh config
		const freshConfig = getPrivateConfig();
		const userEmail = getSafeUserEmail();
		
		// Check user access based on ACCESS_MODE (real-time check)
		if (!checkUserAccess(userEmail, freshConfig)) {
			return {
				error: 'Access denied: User not authorized',
				status: 'access_denied'
			};
		}
		
		const service = new SecureAPIService();
		return service.fetchPrices(tokens, currency);
	} catch (error) {
		return {
			error: error.message,
			status: 'failed'
		};
	}
}

/**
 * Get supported blockchain networks
 * @return {Array} List of supported networks
 */
function getSupportedNetworks() {
	try {
		// Check user access first - get fresh config
		const freshConfig = getPrivateConfig();
		const userEmail = getSafeUserEmail();
		
		// Check user access based on ACCESS_MODE (real-time check)
		if (!checkUserAccess(userEmail, freshConfig)) {
			return {
				error: 'Access denied: User not authorized',
				status: 'access_denied'
			};
		}
		
		const service = new SecureAPIService();
		return service.fetchSupportedNetworks();
	} catch (error) {
		return {
			error: error.message,
			status: 'failed'
		};
	}
}

/**
 * Get list of available coins (limited)
 * @param {number} limit - Maximum number of coins to return
 * @return {Array} List of coins
 */
function getCoinsList(limit = 100) {
	try {
		// Check user access first - get fresh config
		const freshConfig = getPrivateConfig();
		const userEmail = getSafeUserEmail();
		
		// Check user access based on ACCESS_MODE (real-time check)
		if (!checkUserAccess(userEmail, freshConfig)) {
			return {
				error: 'Access denied: User not authorized',
				status: 'access_denied'
			};
		}
		
		const service = new SecureAPIService();
		return service.fetchCoinsList(limit);
	} catch (error) {
		return {
			error: error.message,
			status: 'failed'
		};
	}
}

/**
 * Get current usage statistics for the calling user
 * @return {Object} Usage statistics
 */
function getMyUsage() {
	try {
		// Check user access first - get fresh config
		const freshConfig = getPrivateConfig();
		const userEmail = getSafeUserEmail();
		
		// Check user access based on ACCESS_MODE (real-time check)
		if (!checkUserAccess(userEmail, freshConfig)) {
			return {
				error: 'Access denied: User not authorized',
				status: 'access_denied'
			};
		}
		const rateLimiter = new RateLimiter();
		return rateLimiter.getUsageStats(userEmail);
	} catch (error) {
		return {
			error: error.message,
			status: 'failed'
		};
	}
}

/**
 * Test API connection
 * @return {Object} Connection status
 */
function testConnection() {
	try {
		// Check user access first - get fresh config
		const freshConfig = getPrivateConfig();
		const userEmail = getSafeUserEmail();
		
		// Check user access based on ACCESS_MODE (real-time check)
		if (!checkUserAccess(userEmail, freshConfig)) {
			return {
				error: 'Access denied: User not authorized',
				status: 'access_denied'
			};
		}
		
		const service = new SecureAPIService();
		return {
			status: 'connected',
			version: getVersion(),
			user: getSafeUserEmail(),
			timestamp: new Date().toISOString()
		};
	} catch (error) {
		return {
			status: 'failed',
			error: error.message
		};
	}
}

/**
 * Backend function: Fetch prices and write to user's sheet
 * @param {string} spreadsheetId - User's spreadsheet ID  
 * @param {string} dataSheetName - Name of sheet with token data
 * @param {string} pricesSheetName - Name of sheet to write prices
 * @param {string} currency - Target currency
 * @return {Object} Result with success/error
 */
function fetchPricesForSheet(spreadsheetId, dataSheetName = 'data', pricesSheetName = 'prices', currency = 'usd') {
	try {
		// Check user access first
		const freshConfig = getPrivateConfig();
		const userEmail = getSafeUserEmail();
		
		if (freshConfig.BLOCKED_USERS.includes(userEmail)) {
			return {
				error: 'Access denied: User is blocked',
				status: 'access_denied'
			};
		}
		
		// Open user's spreadsheet
		const userSs = SpreadsheetApp.openById(spreadsheetId);
		const dataSheet = userSs.getSheetByName(dataSheetName);
		
		if (!dataSheet) {
			return {
				error: `Data sheet "${dataSheetName}" not found in your spreadsheet`,
				status: 'failed'
			};
		}
		
		// Get token data from user's sheet
		const tokenData = getTokenDataFromSheet(dataSheet);
		if (tokenData.length === 0) {
			return {
				error: 'No valid token data found in your data sheet',
				status: 'failed'
			};
		}
		
		// Fetch prices using secure API
		const service = new SecureAPIService();
		const priceData = service.fetchPrices(tokenData, currency);
		
		if (priceData.error) {
			return priceData;
		}
		
		// Write prices to user's sheet
		const pricesSheet = userSs.getSheetByName(pricesSheetName) || userSs.insertSheet(pricesSheetName);
		writePricesToSheet(pricesSheet, priceData, tokenData);
		
		return {
			status: 'success',
			message: `Updated ${tokenData.length} cryptocurrency prices`,
			tokensProcessed: tokenData.length,
			sheetUpdated: pricesSheetName
		};
		
	} catch (error) {
		return {
			error: error.message,
			status: 'failed'
		};
	}
}

/**
 * Backend function: Get supported networks and write to user's sheet
 * @param {string} spreadsheetId - User's spreadsheet ID
 * @param {string} networksSheetName - Name of sheet to write networks
 * @return {Object} Result with success/error
 */
function getNetworksForSheet(spreadsheetId, networksSheetName = 'networks') {
	try {
		// Check user access first
		const freshConfig = getPrivateConfig();
		const userEmail = getSafeUserEmail();
		
		if (freshConfig.BLOCKED_USERS.includes(userEmail)) {
			return {
				error: 'Access denied: User is blocked',
				status: 'access_denied'
			};
		}
		
		// Get networks from secure API
		const service = new SecureAPIService();
		const networksData = service.fetchSupportedNetworks();
		
		if (networksData.error) {
			return networksData;
		}
		
		// Write to user's sheet
		const userSs = SpreadsheetApp.openById(spreadsheetId);
		const networksSheet = userSs.getSheetByName(networksSheetName) || userSs.insertSheet(networksSheetName);
		writeNetworksToSheet(networksSheet, networksData);
		
		return {
			status: 'success',
			message: 'Supported networks updated successfully',
			sheetUpdated: networksSheetName
		};
		
	} catch (error) {
		return {
			error: error.message,
			status: 'failed'
		};
	}
}

/**
 * Backend function: Get available coins and write to user's sheet
 * @param {string} spreadsheetId - User's spreadsheet ID
 * @param {string} coinsSheetName - Name of sheet to write coins
 * @param {number} limit - Maximum number of coins
 * @return {Object} Result with success/error  
 */
function getCoinsForSheet(spreadsheetId, coinsSheetName = 'coins', limit = 50) {
	try {
		// Check user access first
		const freshConfig = getPrivateConfig();
		const userEmail = getSafeUserEmail();
		
		if (freshConfig.BLOCKED_USERS.includes(userEmail)) {
			return {
				error: 'Access denied: User is blocked',
				status: 'access_denied'
			};
		}
		
		// Get coins from secure API
		const service = new SecureAPIService();
		const coinsData = service.fetchCoinsList(limit);
		
		if (coinsData.error) {
			return coinsData;
		}
		
		// Write to user's sheet
		const userSs = SpreadsheetApp.openById(spreadsheetId);
		const coinsSheet = userSs.getSheetByName(coinsSheetName) || userSs.insertSheet(coinsSheetName);
		writeCoinsToSheet(coinsSheet, coinsData);
		
		return {
			status: 'success',
			message: `Available coins updated successfully (showing first ${limit})`,
			sheetUpdated: coinsSheetName
		};
		
	} catch (error) {
		return {
			error: error.message,
			status: 'failed'
		};
	}
}

/**
 * Helper: Extract token data from user's sheet
 */
function getTokenDataFromSheet(sheet) {
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
 * Helper: Write price data to user's sheet
 */
function writePricesToSheet(sheet, priceData, originalTokens) {
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
		
		// Format columns
		sheet.getRange(2, 4, rows.length, 1).setNumberFormat('$#,##0.00000');
		sheet.getRange(2, 5, rows.length, 1).setNumberFormat('0.00%');
	}
	
	// Auto-resize and add timestamp
	sheet.autoResizeColumns(1, headers.length);
	sheet.getRange(rows.length + 3, 1).setValue(`Last updated: ${new Date().toLocaleString()}`);
}

/**
 * Helper: Write networks data to user's sheet
 */
function writeNetworksToSheet(sheet, networksData) {
	sheet.clear();
	
	const headers = ['Network', 'Description'];
	sheet.getRange(1, 1, 1, headers.length)
		.setValues([headers])
		.setFontWeight('bold')
		.setBackground('#1a73e8')
		.setFontColor('white');
	
	if (networksData.data && Array.isArray(networksData.data)) {
		const rows = networksData.data.map(network => [network.id || network, network.name || 'N/A']);
		if (rows.length > 0) {
			sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
		}
	}
	
	sheet.autoResizeColumns(1, headers.length);
}

/**
 * Helper: Write coins data to user's sheet
 */
function writeCoinsToSheet(sheet, coinsData) {
	sheet.clear();
	
	const headers = ['Coin ID', 'Symbol', 'Name'];
	sheet.getRange(1, 1, 1, headers.length)
		.setValues([headers])
		.setFontWeight('bold')
		.setBackground('#1a73e8')
		.setFontColor('white');
	
	if (coinsData.data && Array.isArray(coinsData.data)) {
		const rows = coinsData.data.map(coin => [
			coin.id || coin.coinId || 'unknown',
			coin.symbol || 'N/A',
			coin.name || 'Unknown'
		]);
		if (rows.length > 0) {
			sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
		}
	}
	
	sheet.autoResizeColumns(1, headers.length);
}

/**
 * ADMIN ONLY: Get usage analytics (only works for admin email)
 */
function getUsageAnalytics() {
	const userEmail = getSafeUserEmail();
  
	if (userEmail !== PRIVATE_CONFIG.ADMIN_EMAIL || isAnonymousUser(userEmail)) {
		return { error: 'Unauthorized: Admin access only' };
	}
  
	// Return usage analytics
	const properties = PropertiesService.getScriptProperties();
	const allKeys = properties.getKeys();
	const stats = {};
  
	allKeys.forEach(key => {
		if (key.startsWith('rate_')) {
			stats[key] = properties.getProperty(key);
		}
	});
  
	return stats;
}
