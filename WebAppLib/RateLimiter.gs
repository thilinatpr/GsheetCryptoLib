/**
 * Rate limiting to prevent abuse
 * Tracks usage per user using Script Properties
 */
class RateLimiter {
	constructor() {
		this.properties = PropertiesService.getScriptProperties();
	}
  
	/**
	 * Check if user has exceeded rate limits
	 */
	checkLimit(userEmail) {
		const now = new Date();
		const hourKey = `rate_hour_${userEmail}_${now.getHours()}`;
		const dayKey = `rate_day_${userEmail}_${now.toDateString()}`;
    
		// Get current counts
		const hourCount = parseInt(this.properties.getProperty(hourKey) || '0');
		const dayCount = parseInt(this.properties.getProperty(dayKey) || '0');
    
		// Check limits
		if (hourCount >= PRIVATE_CONFIG.RATE_LIMITS.maxRequestsPerHour) {
			throw new Error(`Rate limit exceeded: Maximum ${PRIVATE_CONFIG.RATE_LIMITS.maxRequestsPerHour} requests per hour`);
		}
    
		if (dayCount >= PRIVATE_CONFIG.RATE_LIMITS.maxRequestsPerDay) {
			throw new Error(`Rate limit exceeded: Maximum ${PRIVATE_CONFIG.RATE_LIMITS.maxRequestsPerDay} requests per day`);
		}
    
		// Increment counts
		this.properties.setProperty(hourKey, String(hourCount + 1));
		this.properties.setProperty(dayKey, String(dayCount + 1));
    
		// Clean up old keys (runs occasionally)
		if (Math.random() < 0.1) { // 10% chance to clean up
			this.cleanupOldKeys();
		}
    
		return true;
	}
  
	/**
	 * Clean up old rate limit keys
	 */
	cleanupOldKeys() {
		const allKeys = this.properties.getKeys();
		const now = new Date();
		const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    
		allKeys.forEach(key => {
			if (key.startsWith('rate_') && !key.includes(now.toDateString()) && !key.includes(yesterday)) {
				this.properties.deleteProperty(key);
			}
		});
	}
  
	/**
	 * Get usage statistics for admin
	 */
	getUsageStats(userEmail) {
		const now = new Date();
		const hourKey = `rate_hour_${userEmail}_${now.getHours()}`;
		const dayKey = `rate_day_${userEmail}_${now.toDateString()}`;
    
		return {
			hourly: parseInt(this.properties.getProperty(hourKey) || '0'),
			daily: parseInt(this.properties.getProperty(dayKey) || '0'),
			limits: PRIVATE_CONFIG.RATE_LIMITS
		};
	}
}
