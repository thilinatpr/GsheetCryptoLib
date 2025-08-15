
# GsheetCryptoLib

A secure Google Apps Script library for tracking cryptocurrency prices in Google Sheets with backend-controlled operations and real-time admin management.

## Features
- Fetch live crypto prices securely (API key never exposed)
- Real-time admin sheet access control (no cached configuration)
- Backend-controlled sheet operations (prices, networks, coins)
- Rate limiting per user (100/hour, 1000/day by default)
- Admin analytics and usage tracking via Google Sheets
- Library-only architecture for simplified integration

## Directory Structure
```
GsheetCryptoLib/
├── UserTemplate/         # Simplified library-only integration example
│   ├── Config.gs         # Library configuration (identifier, sheet names)
│   ├── Main.gs           # Backend library function calls
│   ├── Menu.gs           # Custom menu for Google Sheets
│   └── README.md         # Setup guide
├── AppLib/               # Core library code for Apps Script deployment
│   ├── Config.gs         # Private config (API key, admin, limits)
│   ├── PublicAPI.gs      # Main public API functions
│   ├── AdminManager.gs   # Complete admin sheet management
│   ├── RateLimiter.gs    # Per-user rate limiting
│   ├── SecureAPIService.gs # Secure API with admin sheet logging
│   ├── EmailUtils.gs     # Safe email handling utilities
│   └── README.md         # Library deployment guide
├── simple_test.gs        # Basic testing script
├── ADMIN_SETUP_GUIDE.md  # Admin sheet configuration guide
└── CLAUDE.md             # Technical documentation
```

## Usage

### Library Deployment (Recommended)
1. Deploy `AppLib/` as Google Apps Script Library
2. Configure admin sheet ID in `AppLib/Config.gs`
3. Add library to user projects and call backend functions
4. See `UserTemplate/README.md` for complete setup guide

### Quick Start
```javascript
// In UserTemplate or user project
const result = CryptoLib.fetchPricesForSheet(
  spreadsheetId, 
  'data',      // data sheet name
  'prices',    // output sheet name
  'usd'        // currency
);
```

## Admin Management
- **Setup**: See `ADMIN_SETUP_GUIDE.md` for Google Sheets admin configuration
- **Real-time Control**: Manage users, settings, and view analytics via Google Sheets
- **Access Control**: ALLOWED/BLOCKED status enforced instantly
- **Analytics**: Usage tracking and logging automatically handled

## Security
- API keys and sensitive logic never exposed to users
- Real-time admin sheet access control (no cached configuration)
- All sheet operations controlled by backend functions
- Rate limiting and user restrictions enforced server-side
- Complete audit trail via admin sheet logging

## Contributing
Pull requests and issues are welcome!

## License
MIT