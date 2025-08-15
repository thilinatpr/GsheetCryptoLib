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
 * Main function to fetch cryptocurrency prices
 * @param {Array} tokens - Array of token objects with coinId, symbol, name
 * @param {string} currency - Target currency (default: 'usd')
 * @return {Object} Price data
 */
function fetchCryptoPrices(tokens, currency = 'usd') {
  try {
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
    const userEmail = Session.getActiveUser().getEmail();
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
    const service = new SecureAPIService();
    return {
      status: 'connected',
      version: getVersion(),
      user: Session.getActiveUser().getEmail(),
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
 * ADMIN ONLY: Get usage analytics (only works for admin email)
 */
function getUsageAnalytics() {
  const userEmail = Session.getActiveUser().getEmail();
  
  if (userEmail !== PRIVATE_CONFIG.ADMIN_EMAIL) {
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