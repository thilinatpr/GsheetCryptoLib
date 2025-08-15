/**
 * PRIVATE CONFIGURATION - Not exposed to library users
 * This file contains sensitive data that remains hidden
 */
const PRIVATE_CONFIG = {
  // Your master API key - NEVER exposed to users
  MASTER_API_KEY: 'CG-JP3DnpxLxLYWBNjDJR1DiHpf', // Replace with your actual API key
  
  // Rate limiting per user
  RATE_LIMITS: {
    maxRequestsPerHour: 100,
    maxRequestsPerDay: 1000
  },
  
  // Whitelist/Blacklist (optional)
  ALLOWED_DOMAINS: [], // Leave empty to allow all, or add specific domains
  BLOCKED_USERS: [], // Add emails to block specific users
  
  // Your admin email
  ADMIN_EMAIL: 'your-email@gmail.com' // Replace with your email
};

/**
 * Internal function to get the master API key
 * This function is NEVER exposed through the library
 */
function getMasterApiKey() {
  return PRIVATE_CONFIG.MASTER_API_KEY;
}

/**
 * Check if user is authorized (internal use only)
 */
function isUserAuthorized() {
  try {
    const userEmail = Session.getActiveUser().getEmail();
    
    // Check if user is blocked
    if (PRIVATE_CONFIG.BLOCKED_USERS.includes(userEmail)) {
      throw new Error('Access denied: User is blocked');
    }
    
    // Check domain restrictions if configured
    if (PRIVATE_CONFIG.ALLOWED_DOMAINS.length > 0) {
      const userDomain = userEmail.split('@')[1];
      if (!PRIVATE_CONFIG.ALLOWED_DOMAINS.includes(userDomain)) {
        throw new Error('Access denied: Domain not authorized');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Authorization check failed:', error);
    return false;
  }
}