/**
 * Minimal secure webapp entrypoint for the crypto library
 * Accepts POST JSON: { action: string, payload: object }
 * Only whitelisted actions are executed.
 */
function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch (err) { return jsonError(400, 'Invalid JSON'); }
    } else {
      return jsonError(400, 'Missing post body');
    }

    var action = body.action;
    var payload = body.payload || {};

    // whitelist allowed public actions
    var ALLOWED = {
      'fetchCryptoPrices': true,
      'getMyUsage': true,
      'testConnection': true,
      'getSupportedNetworks': true,
      'getCoinsList': true
    };

    if (!action || !ALLOWED[action]) {
      return jsonError(403, 'Action not allowed');
    }

    if (typeof this[action] !== 'function') {
      return jsonError(404, 'Action not found');
    }

    // Call the function. If your functions expect (payload) or specific args adjust as needed.
    var result;
    if (action === 'fetchCryptoPrices') {
      // expects tokens, currency
      result = this[action](payload.tokens, payload.currency);
    } else if (action === 'getCoinsList') {
      result = this[action](payload.limit);
    } else {
      result = this[action]();
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return jsonError(500, err && err.message ? err.message : String(err));
  }
}

function jsonError(code, message) {
  var out = { status: 'error', code: code, message: message };
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
