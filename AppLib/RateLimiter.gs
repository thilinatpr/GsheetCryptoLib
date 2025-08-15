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
		// Handle anonymous users with shared rate limiting
		if (isAnonymousUser(userEmail)) {
			return this.checkAnonymousLimit();
		}
		
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
		// Handle anonymous users
		if (isAnonymousUser(userEmail)) {
			return this.getAnonymousUsageStats();
		}
		
		const now = new Date();
		const hourKey = `rate_hour_${userEmail}_${now.getHours()}`;
		const dayKey = `rate_day_${userEmail}_${now.toDateString()}`;
    
		return {
			hourly: parseInt(this.properties.getProperty(hourKey) || '0'),
			daily: parseInt(this.properties.getProperty(dayKey) || '0'),
			limits: PRIVATE_CONFIG.RATE_LIMITS,
			userType: 'authenticated'
		};
	}
	
	/**
	 * Check rate limits for anonymous users (shared pool)
	 */
	checkAnonymousLimit() {
		const now = new Date();
		const hourKey = `rate_anon_hour_${now.getHours()}`;
		const dayKey = `rate_anon_day_${now.toDateString()}`;
		
		// Get current counts
		const hourCount = parseInt(this.properties.getProperty(hourKey) || '0');
		const dayCount = parseInt(this.properties.getProperty(dayKey) || '0');
		
		// Use reduced limits for anonymous users (50% of normal limits)
		const anonLimits = {
			maxRequestsPerHour: Math.floor(PRIVATE_CONFIG.RATE_LIMITS.maxRequestsPerHour * 0.5),
			maxRequestsPerDay: Math.floor(PRIVATE_CONFIG.RATE_LIMITS.maxRequestsPerDay * 0.5)
		};
		
		// Check limits
		if (hourCount >= anonLimits.maxRequestsPerHour) {
			throw new Error(`Anonymous rate limit exceeded: Maximum ${anonLimits.maxRequestsPerHour} requests per hour`);
		}
		
		if (dayCount >= anonLimits.maxRequestsPerDay) {
			throw new Error(`Anonymous rate limit exceeded: Maximum ${anonLimits.maxRequestsPerDay} requests per day`);
		}
		
		// Increment counts
		this.properties.setProperty(hourKey, String(hourCount + 1));
		this.properties.setProperty(dayKey, String(dayCount + 1));
		
		return true;
	}
	
	/**
	 * Get usage statistics for anonymous users
	 */
	getAnonymousUsageStats() {
		const now = new Date();
		const hourKey = `rate_anon_hour_${now.getHours()}`;
		const dayKey = `rate_anon_day_${now.toDateString()}`;
		
		const anonLimits = {
			maxRequestsPerHour: Math.floor(PRIVATE_CONFIG.RATE_LIMITS.maxRequestsPerHour * 0.5),
			maxRequestsPerDay: Math.floor(PRIVATE_CONFIG.RATE_LIMITS.maxRequestsPerDay * 0.5)
		};
		
		return {
			hourly: parseInt(this.properties.getProperty(hourKey) || '0'),
			daily: parseInt(this.properties.getProperty(dayKey) || '0'),
			limits: anonLimits,
			userType: 'anonymous'
		};
	}
}
