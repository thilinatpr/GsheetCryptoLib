/**
 * Email Utility Functions for Safe User Identification
 * Handles cases where Session.getActiveUser().getEmail() may not be available
 */

/**
 * Safely get user email with fallback handling
 * @return {string} User email or anonymous identifier
 */
function getSafeUserEmail() {
  try {
    const email = Session.getActiveUser().getEmail();
    if (email && email.trim()) {
      return email.trim().toLowerCase();
    } else {
      console.warn('Session.getActiveUser().getEmail() returned empty value');
      return generateAnonymousId();
    }
  } catch (error) {
    console.warn('Could not get user email:', error.message);
    return generateAnonymousId();
  }
}

/**
 * Generate consistent anonymous identifier for users without email
 * Uses session-based identifier when possible
 * @return {string} Anonymous user identifier
 */
function generateAnonymousId() {
  try {
    // Try to get some session identifier
    const tempKey = Session.getTemporaryActiveUserKey();
    if (tempKey) {
      return `anonymous_${Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, tempKey).slice(0, 8)}`;
    }
  } catch (error) {
    // Session methods not available
  }
  
  // Fallback to timestamp-based identifier
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `anonymous_${timestamp}_${random}`;
}

/**
 * Check if user identifier is anonymous
 * @param {string} userEmail - User identifier to check
 * @return {boolean} True if anonymous
 */
function isAnonymousUser(userEmail) {
  return userEmail && userEmail.startsWith('anonymous_');
}

/**
 * Get user domain from email (safe version)
 * @param {string} userEmail - User email or identifier
 * @return {string} Domain or 'anonymous' for anonymous users
 */
function getSafeUserDomain(userEmail) {
  if (isAnonymousUser(userEmail)) {
    return 'anonymous';
  }
  
  try {
    const parts = userEmail.split('@');
    return parts.length > 1 ? parts[1].toLowerCase() : 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Check if user email is valid format
 * @param {string} userEmail - Email to validate
 * @return {boolean} True if valid email format
 */
function isValidEmail(userEmail) {
  if (!userEmail || isAnonymousUser(userEmail)) {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(userEmail);
}