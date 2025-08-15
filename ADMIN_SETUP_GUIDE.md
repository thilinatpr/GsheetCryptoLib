# Admin Sheet Setup Guide

## Overview
Manage your crypto library users, settings, and analytics through Google Sheets instead of editing code.

## Setup Steps

### 1. Create Admin Google Sheet
1. Create a new Google Sheet
2. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
3. In WebAppLib/AdminManager.gs, set: `SHEET_ID: 'YOUR_SHEET_ID'`

### 2. Initialize Sheet Structure
Call the admin function to create the sheet structure:

**Via Apps Script:**
```javascript
function setup() {
  initializeAdminSheet();
}
```

This creates 4 sheets: Users, Settings, Usage, Logs

## Sheet Management

### Users Sheet
Manage who can access your API:

| Email | Status | Domain | Added Date | Last Used | Total Requests | Notes |
|-------|--------|--------|------------|-----------|----------------|--------|
| user@example.com | ALLOWED | example.com | 2024-01-01 | 2024-01-15 | 150 | Regular user |
| spam@bad.com | BLOCKED | bad.com | 2024-01-01 | - | 0 | Blocked for abuse |

**Status Options:**
- `ALLOWED` - User can access the API
- `BLOCKED` - User is denied access

### Settings Sheet
Configure system behavior:

| Setting | Value | Description |
|---------|-------|-------------|
| ACCESS_MODE | OPEN | OPEN, EMAIL_WHITELIST, DOMAIN_WHITELIST, MIXED |
| MAX_REQUESTS_PER_HOUR | 100 | Hourly rate limit per user |
| MAX_REQUESTS_PER_DAY | 1000 | Daily rate limit per user |
| ADMIN_EMAIL | admin@example.com | Administrator email address |
| API_KEY | CG-xxx | CoinGecko API key |

**Access Modes:**
- `OPEN` - Anyone can use the API
- `EMAIL_WHITELIST` - Only emails in Users sheet with ALLOWED status
- `DOMAIN_WHITELIST` - Only users from allowed domains
- `MIXED` - Either email OR domain whitelist

### Usage Sheet (Auto-populated)
Real-time usage analytics:

| Date | User | Action | Status | Response Time (ms) | Tokens Requested | IP Address |
|------|------|--------|--------|-------------------|------------------|------------|
| 2024-01-15 10:30 | user@example.com | fetchCryptoPrices | SUCCESS | 250 | 5 | 192.168.1.1 |

### Logs Sheet (Auto-populated)
System logs and events:

| Timestamp | Level | User | Message | Details |
|-----------|-------|------|---------|---------|
| 2024-01-15 10:30 | INFO | admin | Configuration refreshed | {...} |

## Admin Functions

### Via Apps Script (Admin Only)

**Get System Status:**
```javascript
function getStatus() {
  const status = getSystemStatus();
  console.log(status);
}
```

**Get Analytics:**
```javascript
function getAnalytics() {
  const analytics = getUserAnalytics();
  console.log(analytics);
}
```

**Refresh Config:**
```javascript
function refresh() {
  const result = refreshConfig();
  console.log(result);
}
```

### Security

- Only the admin email can call admin functions
- All API calls are logged with user, action, and status
- Blocked users are denied immediately
- Rate limiting is enforced per user

## Configuration Flow

1. **Edit Settings Sheet** - Change ACCESS_MODE, rate limits, etc.
2. **Edit Users Sheet** - Add/remove allowed users, block users
3. **Call refreshConfig** - Reload configuration from sheets
4. **Check Usage/Logs** - Monitor API usage and system events

## Benefits

- **No code changes** needed to manage users
- **Real-time analytics** in Google Sheets
- **Easy user management** - just edit the Users sheet
- **Audit trail** - all actions logged
- **Rate limiting** per user automatically enforced

## Example Workflow

1. User requests access → Add to Users sheet with ALLOWED status
2. User abuses API → Change status to BLOCKED in Users sheet
3. Need tighter security → Change ACCESS_MODE to EMAIL_WHITELIST
4. Monitor usage → Check Usage sheet for analytics
5. Troubleshoot issues → Check Logs sheet for errors