/**
 * Secure CoinGecko API Service
 * Uses master API key internally - never exposed to users
 */
class SecureAPIService {
	constructor() {
		// Verify user authorization
		if (!isUserAuthorized()) {
			throw new Error('Unauthorized access');
		}
    
		// Initialize with master API key (hidden from users)
		this.apiKey = getMasterApiKey();
		this.baseUrl = "https://api.coingecko.com/api/v3";
		this.rateLimiter = new RateLimiter();
    
		// Log usage for analytics (optional)
		this.logUsage('service_init');
	}
  
	/**
	 * Fetch prices with rate limiting and logging
	 */
	fetchPrices(tokens, currency = 'usd') {
		try {
			// Check rate limits
			const userEmail = getSafeUserEmail();
			this.rateLimiter.checkLimit(userEmail);
      
			// Log the request
			this.logUsage('fetch_prices', { 
				tokenCount: tokens.length, 
				currency: currency 
			});
      
			// Validate input
			if (!Array.isArray(tokens) || tokens.length === 0) {
				return { error: 'No tokens provided' };
			}
      
			if (tokens.length > 50) {
				return { error: 'Maximum 50 tokens per request' };
			}
      
			// Make the API call using master key
			const coinIds = tokens.map(t => t.coinId.toLowerCase()).join(',');
			const url = `${this.baseUrl}/simple/price`;
      
			const params = {
				ids: coinIds,
				vs_currencies: currency.toLowerCase(),
				include_24hr_change: 'true'
			};
      
			const queryString = Object.entries(params)
				.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
				.join('&');
      
			const fullUrl = `${url}?${queryString}`;
      
			const options = {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'x-cg-demo-api-key': this.apiKey // Using master key
				},
				muteHttpExceptions: true
			};
      
			const response = UrlFetchApp.fetch(fullUrl, options);
			const statusCode = response.getResponseCode();
      
			if (statusCode === 200) {
				const data = JSON.parse(response.getContentText());
				return this.formatPriceData(data, tokens, currency);
			} else {
				throw new Error(`API error: ${statusCode}`);
			}
      
		} catch (error) {
			console.error('Fetch prices error:', error);
			this.logError('fetch_prices', error);
			throw new Error(`Failed to fetch prices: ${error.message}`);
		}
	}
  
	/**
	 * Get supported networks
	 */
	fetchSupportedNetworks() {
		try {
			const userEmail = getSafeUserEmail();
			this.rateLimiter.checkLimit(userEmail);
      
			this.logUsage('fetch_networks');
      
			const url = `${this.baseUrl}/asset_platforms`;
      
			const options = {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'x-cg-demo-api-key': this.apiKey
				},
				muteHttpExceptions: true
			};
      
			const response = UrlFetchApp.fetch(url, options);
      
			if (response.getResponseCode() === 200) {
				const data = JSON.parse(response.getContentText());
				return data.filter(p => p.id && p.name).map(p => ({
					id: p.id,
					name: p.name,
					shortname: p.shortname || 'N/A'
				}));
			} else {
				throw new Error('Failed to fetch networks');
			}
      
		} catch (error) {
			console.error('Fetch networks error:', error);
			this.logError('fetch_networks', error);
			throw new Error(`Failed to fetch networks: ${error.message}`);
		}
	}
  
	/**
	 * Get coins list (limited for security)
	 */
	fetchCoinsList(limit = 100) {
		try {
			const userEmail = getSafeUserEmail();
			this.rateLimiter.checkLimit(userEmail);
      
			this.logUsage('fetch_coins_list');
      
			const url = `${this.baseUrl}/coins/list`;
      
			const options = {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'x-cg-demo-api-key': this.apiKey
				},
				muteHttpExceptions: true
			};
      
			const response = UrlFetchApp.fetch(url, options);
      
			if (response.getResponseCode() === 200) {
				const data = JSON.parse(response.getContentText());
				// Limit the response to prevent abuse
				return data.slice(0, Math.min(limit, 1000)).map(coin => ({
					id: coin.id,
					symbol: coin.symbol.toUpperCase(),
					name: coin.name
				}));
			} else {
				throw new Error('Failed to fetch coins list');
			}
      
		} catch (error) {
			console.error('Fetch coins error:', error);
			this.logError('fetch_coins_list', error);
			throw new Error(`Failed to fetch coins: ${error.message}`);
		}
	}
  
	/**
	 * Format price data
	 */
	formatPriceData(apiData, tokens, currency) {
		const result = {};
		const currencyKey = currency.toLowerCase();
    
		Object.entries(apiData).forEach(([coinId, priceData]) => {
			const token = tokens.find(t => t.coinId.toLowerCase() === coinId.toLowerCase());
			if (!token) return;
      
			result[coinId] = {
				name: token.name || token.symbol || 'Unknown',
				symbol: token.symbol || 'UNKNOWN',
				coinId: coinId,
				current_price: priceData[currencyKey] || 0,
				price_change_percentage_24h: priceData[`${currencyKey}_24h_change`] || 0,
				last_updated: new Date().toISOString()
			};
		});
    
		return result;
	}
  
	/**
	 * Log usage for analytics
	 */
	logUsage(action, details = {}) {
		try {
			const log = {
				timestamp: new Date().toISOString(),
				user: getSafeUserEmail(),
				action: action,
				details: details
			};
      
			console.log('Usage:', JSON.stringify(log));
      
			// Optional: Store in a spreadsheet for analytics
			// this.storeUsageLog(log);
		} catch (error) {
			// Silent fail - don't break the main flow
		}
	}
  
	/**
	 * Log errors for debugging
	 */
	logError(action, error) {
		try {
			const log = {
				timestamp: new Date().toISOString(),
				user: getSafeUserEmail(),
				action: action,
				error: error.message || error.toString()
			};
      
			console.error('Error log:', JSON.stringify(log));
      
			// Optional: Store errors for review
			// this.storeErrorLog(log);
		} catch (e) {
			// Silent fail
		}
	}
}
