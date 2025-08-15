
# GsheetCryptoLib

A secure, modular Google Apps Script library and webapp for tracking cryptocurrency prices in Google Sheets.

## Features
- Fetch live crypto prices securely (API key never exposed)
- Rate limiting per user (100/hour, 1000/day by default)
- Supports custom tokens, networks, and coins
- Admin analytics and usage tracking
- Can be used as an Apps Script Library or deployed as a Web App

## Directory Structure
```
GsheetCryptoLib/
├── UserTemplate/         # Example user-facing Apps Script project
│   ├── Config.gs         # User config (sheet names, currency, etc)
│   ├── Main.gs           # Main logic (fetch prices, menu, etc)
│   └── Menu.gs           # Custom menu for Google Sheets
├── lib/                  # Secure library code (for Library deployment)
│   ├── Config.gs         # Private config (API key, admin, limits)
│   ├── PublicAPI.gs      # Public API surface (functions users can call)
│   ├── RateLimiter.gs    # Per-user rate limiting
│   ├── SecureAPIService.gs # Secure API logic
│   └── README.md         # Library usage notes
├── WebAppLib/            # Webapp-ready copy of the library
│   ├── (same as lib/ plus WebApp.gs entrypoint)
│   └── WebApp.gs         # doPost() entrypoint for webapp
└── README.md             # (this file)
```

## Usage

### As an Apps Script Library
1. Open your Google Sheet's Apps Script editor.
2. Add the library using the deployment ID from `lib` (see `lib/README.md`).
3. Use the functions in your script (see `UserTemplate/Main.gs` for examples).

### As a Web App
1. Open `WebAppLib` in the Apps Script editor.
2. Deploy as a Web App (Deploy → New deployment → Web app).
   - Execute as: Me (script owner)
   - Who has access: Anyone (or restrict by email in `WebApp.gs`)
3. Use the deployment ID in your client code to call the webapp via `UrlFetchApp`.

## Security
- API keys and sensitive logic are never exposed to users.
- Rate limiting and user/domain restrictions are enforced server-side.
- You can further restrict access by editing the whitelist in `WebAppLib/WebApp.gs`.

## Contributing
Pull requests and issues are welcome!

## License
MIT