/**
 * PRIVATE CONFIGURATION - Not exposed to library users
 * This file contains sensitive data that remains hidden
 * Configuration can be managed via Google Sheets for easier admin
 */

// Admin sheet configuration
const ADMIN_CONFIG = {
  SHEET_ID: '1k3yCjvsOrh-n56-Xqyx89Ji70NQlNkme-j0vWL2WIpA', // Set your admin Google Sheet ID here
  SHEETS: {
    USERS: 'Users',
    SETTINGS: 'Settings', 
    USAGE: 'Usage',
    LOGS: 'Logs'
  }
};

// Default fallback configuration
const DEFAULT_CONFIG = {
	MASTER_API_KEY: 'CG-JP3DnpxLxLYWBNjDJR1DiHpf', // Replace with your actual API key
	RATE_LIMITS: {
		maxRequestsPerHour: 100,
		maxRequestsPerDay: 1000
	},
	ALLOWED_EMAILS: [],
	ALLOWED_DOMAINS: [],
	BLOCKED_USERS: [],
	ACCESS_MODE: 'EMAIL_WHITELIST',
	ADMIN_EMAIL: 'serendibscribe@gmail.com'
};

/**
 * Get configuration with sheet-based overrides
 */
function getPrivateConfig() {
	// Start with default config
	let config = { ...DEFAULT_CONFIG };
	
	// Check if admin sheet is configured
	if (!ADMIN_CONFIG.SHEET_ID) {
		console.warn('Admin sheet not configured, using default config');
		return config;
	}
	
	try {
		// Override with sheet settings if available
		const accessMode = getSettingFromSheet('ACCESS_MODE');
		if (accessMode) config.ACCESS_MODE = accessMode;
		
		const adminEmail = getSettingFromSheet('ADMIN_EMAIL');
		if (adminEmail) config.ADMIN_EMAIL = adminEmail;
		
		const apiKey = getSettingFromSheet('API_KEY');
		if (apiKey) config.MASTER_API_KEY = apiKey;
		
		const hourlyLimit = getSettingFromSheet('MAX_REQUESTS_PER_HOUR');
		if (hourlyLimit) config.RATE_LIMITS.maxRequestsPerHour = parseInt(hourlyLimit);
		
		const dailyLimit = getSettingFromSheet('MAX_REQUESTS_PER_DAY');
		if (dailyLimit) config.RATE_LIMITS.maxRequestsPerDay = parseInt(dailyLimit);
		
		// Get user lists from sheet
		config.ALLOWED_EMAILS = getAllowedUsersFromSheet();
		config.BLOCKED_USERS = getBlockedUsersFromSheet();
		
	} catch (error) {
		console.warn('Could not load sheet config, using defaults:', error.message);
		// Don't call logToSheet here since that might also fail
	}
	
	return config;
}

// Create a cached version to avoid repeated sheet reads
const PRIVATE_CONFIG = getPrivateConfig();

/**
 * Internal function to get the master API key
 * This function is NEVER exposed through the library
 */
function getMasterApiKey() {
	return PRIVATE_CONFIG.MASTER_API_KEY;
}

/**
 * Check if user is authorized based on ACCESS_MODE (internal use only)
 */
function checkUserAccess(userEmail, config) {
	try {
		if (!userEmail) {
			throw new Error('Access denied: No user email provided');
		}
		
		const userEmailLower = userEmail.toLowerCase().trim();
		
		// Check if user is anonymous (not logged in with valid Google account)
		if (isAnonymousUser(userEmailLower)) {
			throw new Error('Access denied: Anonymous users not allowed');
		}
		
		// Validate email format
		if (!isValidEmail(userEmailLower)) {
			throw new Error('Access denied: Invalid email format');
		}
		
		const userDomain = userEmailLower.split('@')[1];
		
		// First check: Always block if user is explicitly blocked
		if (config.BLOCKED_USERS.includes(userEmailLower)) {
			throw new Error('Access denied: User is blocked');
		}
		
		// Second check: Apply ACCESS_MODE rules
		console.log('Checking access for user:', userEmailLower, 'Mode:', config.ACCESS_MODE, 'Allowed emails:', config.ALLOWED_EMAILS.length);
		switch (config.ACCESS_MODE) {
			case 'OPEN':
				// Allow anyone who isn't blocked
				return true;
				
			case 'EMAIL_WHITELIST':
				// Only allow users explicitly in the allowed list
				if (!config.ALLOWED_EMAILS.includes(userEmailLower)) {
					throw new Error('Access denied: Email not in whitelist');
				}
				return true;
				
			case 'DOMAIN_WHITELIST':
				// Only allow users from allowed domains
				if (!config.ALLOWED_DOMAINS.includes(userDomain)) {
					throw new Error('Access denied: Domain not in whitelist');
				}
				return true;
				
			case 'MIXED':
				// Allow if either email is whitelisted OR domain is whitelisted
				if (!config.ALLOWED_EMAILS.includes(userEmailLower) && 
					!config.ALLOWED_DOMAINS.includes(userDomain)) {
					throw new Error('Access denied: Neither email nor domain is whitelisted');
				}
				return true;
				
			default:
				// Default to EMAIL_WHITELIST for security (restrictive mode)
				if (!config.ALLOWED_EMAILS.includes(userEmailLower)) {
					throw new Error('Access denied: Invalid access mode, defaulting to whitelist - email not allowed');
				}
				return true;
		}
	} catch (error) {
		console.error('Access check failed for user:', userEmail, 'Error:', error.message);
		return false;
	}
}

/**
 * Check if user is authorized (internal use only) - DEPRECATED
 * Use checkUserAccess() instead for proper ACCESS_MODE handling
 */
function isUserAuthorized() {
	try {
		const userEmail = Session.getActiveUser().getEmail();
		const config = getPrivateConfig();
		return checkUserAccess(userEmail, config);
	} catch (error) {
		console.error('Authorization check failed:', error);
		return false;
	}
}
