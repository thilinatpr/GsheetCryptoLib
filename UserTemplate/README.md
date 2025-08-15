# UserTemplate Integration Guide

## Overview
This UserTemplate integrates with the crypto API service using the Google Apps Script Library approach, providing secure access to cryptocurrency data with backend-controlled access management.

## Setup

### 1. Deploy the Library
1. **Deploy the Library**:
   - Open `WebAppLib/` in Apps Script
   - Deploy as Library (Deploy → New deployment → Library)
   - Copy the deployment ID

### 2. Add Library to UserTemplate
1. **Add Library to UserTemplate Project**:
   - In Apps Script editor: Libraries → Add library
   - Paste deployment ID
   - Choose latest version
   - Save with identifier: `CryptoLib` (or your chosen name)

### 3. Configure UserTemplate
```javascript
const USER_CONFIG = {
  LIBRARY_IDENTIFIER: 'CryptoLib', // Must match the identifier from step 2
  CURRENCY: 'usd',
  DATA_SHEET: 'data',
  PRICES_SHEET: 'prices',
  NETWORKS_SHEET: 'networks',
  COINS_SHEET: 'coins'
};
```

## Usage

All functions are backend-controlled and respect admin sheet settings:

- `fetchPrices()` - Fetch crypto prices and update sheet (backend handles everything)
- `getSupportedNetworksMenu()` - Get supported networks and update sheet
- `getAvailableCoins()` - Get available coins and update sheet
- `checkMyUsage()` - Check rate limit usage
- `testLibraryConnection()` - Test connection to API service
- `debugUserAccess()` - Debug access permissions (shows admin sheet status)
- `setupSampleData()` - Create sample data in sheet

## Files

- `Config.gs` - Library configuration settings
- `Main.gs` - Core functions (calls backend library functions)
- `Menu.gs` - Google Sheets menu integration
- `README.md` - This guide

## Backend Control

The library backend provides:
- **Real-time Access Control** - Admin can block/allow users via Google Sheets
- **Centralized Management** - All logic controlled by backend admin sheet
- **Usage Analytics** - All API calls logged automatically
- **Rate Limiting** - Per-user limits enforced server-side

## Security

- **API keys remain secure** - Never exposed to UserTemplate users
- **Backend validation** - All requests validated against admin sheet
- **Audit trail** - Complete logging of all operations
- **Rate limiting** - Automatic enforcement per user

## Admin Sheet Integration

The backend reads configuration from an admin Google Sheet:
- **Users Sheet** - Control who can access (ALLOWED/BLOCKED)
- **Settings Sheet** - Configure access modes and rate limits
- **Usage Sheet** - Real-time usage analytics
- **Logs Sheet** - System event logging

Users are automatically checked against this admin sheet on every function call.