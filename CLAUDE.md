# GsheetCryptoLib - Claude Context

## Project Overview
A secure Google Apps Script library for tracking cryptocurrency prices in Google Sheets. This project provides secure API access to cryptocurrency data with built-in rate limiting, real-time admin sheet access control, and backend-controlled sheet operations.

## Architecture

### Core Components
- **UserTemplate/**: Simplified example showing library-only integration 
- **AppLib/**: Secure library code for Apps Script Library deployment
- **simple_test.gs**: Basic testing script for library functions

### Security Model
- API keys and sensitive logic never exposed to end users
- Real-time admin sheet access control (no cached configuration)
- Server-side rate limiting (100/hour, 1000/day by default) 
- All sheet operations controlled by backend functions
- Admin analytics and usage tracking via Google Sheets

## Key Files

### User-Facing Components
- `UserTemplate/Main.gs:4` - Main `fetchPrices()` function that calls backend library functions
- `UserTemplate/Config.gs` - Simple library-only configuration (sheet names, currency preferences)
- `UserTemplate/Menu.gs` - Google Sheets custom menu integration

### Library Core (AppLib/)
- `AppLib/PublicAPI.gs` - Public API surface with functions like `fetchPricesForSheet()`, `debugUserAccess()`
- `AppLib/SecureAPIService.gs` - Internal secure API handling (hidden from users)
- `AppLib/RateLimiter.gs` - Per-user rate limiting implementation
- `AppLib/Config.gs` - Private configuration (API keys, admin settings)
- `AppLib/AdminManager.gs` - Complete admin sheet management system
- `AppLib/EmailUtils.gs` - Safe email handling utilities

## Development Patterns

### Function Structure
- Public functions return objects with `error` field for error handling
- All sensitive operations go through `SecureAPIService` class
- Rate limiting checked before API calls via `RateLimiter` class

### Error Handling
```javascript
// Standard pattern in AppLib/PublicAPI.gs:17-30
function debugUserAccess() {
  try {
    const userEmail = getSafeUserEmail();
    // Test sheet access and return detailed debug info
  } catch (error) {
    return { error: error.message, status: 'failed' };
  }
}
```

### Security Patterns
- User email from `Session.getActiveUser().getEmail()` for rate limiting
- Real-time admin sheet access control via `getPrivateConfig()`
- All functions check fresh admin sheet data before execution
- Backend-controlled sheet operations prevent direct user manipulation

## Deployment (Library-Only Approach)

### Primary Deployment Method
1. Deploy `AppLib/` directory as Library
2. Users add library reference and call backend functions like `CryptoLib.fetchPricesForSheet()`
3. See `UserTemplate/` for simplified integration example
4. Admin manages access via Google Sheets in real-time

### Admin Sheet Setup
1. Deploy library and configure `ADMIN_CONFIG.SHEET_ID` in `AppLib/Config.gs`
2. Admin sheet automatically creates Users, Settings, Usage, and Logs tabs
3. Real-time user access control (ALLOWED/BLOCKED status)

## Main Functions

### Public API (`AppLib/PublicAPI.gs`)
- `getVersion()` - Get library version
- `debugUserAccess()` - Debug admin sheet access permissions and user status
- `fetchPricesForSheet(spreadsheetId, dataSheet, pricesSheet, currency)` - Backend-controlled price fetching
- `getNetworksForSheet(spreadsheetId, networksSheet)` - Backend-controlled networks listing
- `getCoinsForSheet(spreadsheetId, coinsSheet, limit)` - Backend-controlled coins listing
- `getMyUsage()` - Current user's rate limit usage
- `testConnection()` - Verify library connectivity

### User Functions (`UserTemplate/Main.gs`)
- `fetchPrices()` - Calls backend `fetchPricesForSheet()` function
- `checkMyUsage()` - Display usage stats via backend
- `testLibraryConnection()` - Test library integration
- `debugUserAccess()` - Test admin sheet access status

## Configuration
- User config in `USER_CONFIG` object (library identifier, sheet names, currency)
- Admin config in Google Sheets (Users, Settings, Usage, Logs tabs)
- Real-time configuration reading via `getPrivateConfig()` function
- Rate limiting stored in PropertiesService with `rate_` prefix keys

## Admin Sheet Management

### Admin Sheet Structure
- **Users Sheet**: Email addresses with ALLOWED/BLOCKED status
- **Settings Sheet**: Access mode configuration (OPEN, EMAIL_WHITELIST, etc.)
- **Usage Sheet**: Real-time usage analytics and request logging
- **Logs Sheet**: System event logging and error tracking

### Real-time Access Control
- No cached configuration - all access checks read fresh data from admin sheet
- Users can be blocked/allowed instantly via admin sheet updates
- All functions respect admin sheet settings before execution

## Testing
No formal testing framework. Testing done through:
- `simple_test.gs` - Basic testing script for library functions
- `debugUserAccess()` function for admin sheet access testing
- `testConnection()` function for library connectivity
- Manual testing via Google Sheets interface
- Usage analytics for monitoring in production

## Notes
- Library-only architecture (WebApp integration removed)
- All sheet operations controlled by backend functions
- Real-time admin control via Google Sheets
- This is a Google Apps Script project, not a traditional Node.js/web application
- No package.json or traditional build tools
- Deployment handled through Google Apps Script IDE
- No external dependencies beyond Google Apps Script built-ins