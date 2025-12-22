# Backend Implementation Guide — Session-Based Licensing (Matches App v13.1)

This is the single, authoritative backend guide. It matches the Trading Bot app’s current licensing flow exactly.

Use together with: `LICENSE_SPEC.md` (overall system spec). All other prior licensing docs are deprecated and removed.

## 1) Constants

- Base URL: `https://www.signaltradingbots.com/api/license`
- API Key (public): `DBOT-API-KEY-V8`
- API Secret (shared): `Vn$vWn%k!7Yv6k^E*h&X9g@D9mB2zZp3`
  - App v13.1: hardcoded
  - Backend: set env var `API_SECRET` with the exact same value
- Allowed timestamp skew: 5 minutes
- Heartbeat: every 5 minutes; session expires after 5 minutes of inactivity

## 2) Security (Required on every request)

The app signs requests using HMAC-SHA256:

- Canonical business payload: JSON of the non-security fields, sorted by key, compact separators `(',', ':')`
- Message to sign: `timestamp + sorted_business_json`
- Signature: `hex(hmac_sha256(API_SECRET, message))`
- Security fields added by the app:
  - `timestamp` (ISO UTC)
  - `apiKey` (`DBOT-API-KEY-V8`)
  - `signature` (HMAC result)
- Headers: `Content-Type: application/json`, `X-API-Key: DBOT-API-KEY-V8`

Backend must verify for every request:
1) `apiKey` equals `DBOT-API-KEY-V8`
2) `timestamp` within ±5 minutes of server time
3) Recompute signature and constant-time compare with provided `signature`
4) Enforce HTTPS

If verification fails, return `401` with:
```json
{ "success": false, "message": "Security verification failed: <reason>", "errorCode": "SECURITY_ERROR" }
```

## 3) Endpoints (exactly as the app calls them)

The app calls three endpoints. All include the security fields described above.

### 3.1 POST /validate

Request (business fields):
```json
{
  "licenseKey": "DBOT-XXXX-XXXX-XXXX-XXXX",
  "deviceId": "sha256(device_name + mac_address)",
  "appVersion": "V8_2.11"
}
```

On success (create or refresh session):
```json
{
  "success": true,
  "message": "License validated successfully",
  "data": {
    "licenseKey": "DBOT-XXXX-XXXX-XXXX-XXXX",
    "sessionId": "SESSION-ABC123XYZ",
    "deviceId": "abc123...",
    "status": "active",
    "plan": "yearly",
    "expiresAt": "2026-11-30T00:00:00Z",
    "daysRemaining": 365
  }
}
```

Error — license in use on another device:
```json
{
  "success": false,
  "message": "License is already active on another device",
  "errorCode": "LICENSE_IN_USE",
  "data": { "activeDeviceId": "xyz...", "lastSeenAt": "2025-11-30T19:55:00Z" }
}
```

Other errors:
- `INVALID_LICENSE`, `LICENSE_EXPIRED`, `LICENSE_INACTIVE`

Backend logic:
1) Verify signature
2) Fetch license by `licenseKey`; ensure `status='active'` and not expired
3) Check active session for this license:
   - If none: create new session for `deviceId`
   - If exists with same `deviceId`: refresh (update `last_seen_at`) and return success
   - If exists with different `deviceId`:
     - If expired (last_seen_at > 5 min ago) → deactivate and create a new session
     - Else → return `LICENSE_IN_USE`

### 3.2 POST /heartbeat

Request (business fields):
```json
{ "licenseKey": "DBOT-...", "sessionId": "SESSION-...", "deviceId": "abc123..." }
```

Success:
```json
{ "success": true, "message": "Heartbeat received", "data": { "lastSeenAt": "2025-11-30T20:05:00Z", "sessionActive": true } }
```

Errors:
- `SESSION_EXPIRED` (mark session inactive if expired)
- `INVALID_SESSION`

Backend logic:
1) Verify signature
2) Find session by `sessionId`
3) Verify `licenseKey` and `deviceId` match the session
4) If session inactive/expired → error
5) Update `last_seen_at` and return success

### 3.3 POST /deactivate

Request (business fields):
```json
{ "licenseKey": "DBOT-...", "sessionId": "SESSION-..." }
```

Success:
```json
{ "success": true, "message": "Session deactivated successfully" }
```

Errors:
- `SESSION_NOT_FOUND`

Backend logic:
1) Verify signature
2) Find session by `sessionId` and `licenseKey`
3) Mark session inactive

## 4) Database Schema (Minimal and Indexed)

`licenses`:
```sql
CREATE TABLE licenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    license_key VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    plan VARCHAR(20) NOT NULL,
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    payment_id VARCHAR(100),
    amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    INDEX idx_license_key (license_key),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
);
```

`license_sessions`:
```sql
CREATE TABLE license_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    license_key VARCHAR(50) NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    device_mac VARCHAR(50),
    created_at DATETIME NOT NULL,
    last_seen_at DATETIME NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (license_key) REFERENCES licenses(license_key) ON DELETE CASCADE,
    INDEX idx_license_key (license_key),
    INDEX idx_session_id (session_id),
    INDEX idx_device_id (device_id),
    INDEX idx_active (active),
    INDEX idx_last_seen (last_seen_at)
);
```

Rules:
- One active session per `license_key`
- Session expires when `last_seen_at < NOW() - INTERVAL 5 MINUTE` (cleanup job every minute recommended)

## 5) Reference Implementation Snippets (Python/Flask)

Signature verification:
```python
import os, hmac, hashlib, json
from datetime import datetime

API_SECRET = os.getenv('API_SECRET')  # Must equal app’s hardcoded value
API_KEY = "DBOT-API-KEY-V8"

def verify_request_signature(request_data):
    timestamp = request_data.get('timestamp')
    api_key = request_data.get('apiKey')
    signature = request_data.get('signature')

    if api_key != API_KEY:
        return False, "Invalid API key"

    try:
        request_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        now = datetime.utcnow()
        age = (now - request_time.replace(tzinfo=None)).total_seconds()
        if age < 0 or age > 300:
            return False, "Request timestamp expired"
    except Exception:
        return False, "Invalid timestamp format"

    business = {k: v for k, v in request_data.items()
                if k not in ['signature', 'timestamp', 'apiKey']}
    sorted_payload = json.dumps(business, sort_keys=True, separators=(',', ':'))
    message = f"{timestamp}{sorted_payload}"

    expected = hmac.new(API_SECRET.encode('utf-8'),
                        message.encode('utf-8'),
                        hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        return False, "Invalid signature"

    return True, "OK"
```

Validate (outline):
```python
def validate_license_handler(data):
    ok, err = verify_request_signature(data)
    if not ok:
        return 401, {"success": False, "message": f"Security verification failed: {err}", "errorCode": "SECURITY_ERROR"}

    license_key = data["licenseKey"]; device_id = data["deviceId"]
    lic = get_license(license_key)
    if not lic or lic.status != "active":
        return 200, {"success": False, "message": "Invalid license key", "errorCode": "INVALID_LICENSE"}
    if lic.expires_at < now():
        return 200, {"success": False, "message": "License has expired", "errorCode": "LICENSE_EXPIRED"}

    sess = get_active_session(license_key)
    if not sess:
        sess = create_session(license_key, device_id)  # also store device_name/mac if provided
    else:
        if sess.device_id == device_id:
            refresh_session(sess.session_id)
        elif is_expired(sess):
            deactivate_session(sess.session_id)
            sess = create_session(license_key, device_id)
        else:
            return 200, {"success": False, "message": "License is already active on another device", "errorCode": "LICENSE_IN_USE",
                        "data": {"activeDeviceId": sess.device_id, "lastSeenAt": sess.last_seen_at.isoformat()}}

    return 200, {"success": True, "message": "License validated successfully",
                 "data": resp_payload(lic, sess)}
```

Heartbeat (outline):
```python
def heartbeat_handler(data):
    ok, err = verify_request_signature(data)
    if not ok:
        return 401, {"success": False, "message": f"Security verification failed: {err}", "errorCode": "SECURITY_ERROR"}

    lic_key, sess_id, dev_id = data["licenseKey"], data["sessionId"], data["deviceId"]
    sess = get_session(sess_id)
    if not sess or sess.license_key != lic_key or sess.device_id != dev_id:
        return 200, {"success": False, "message": "Invalid session", "errorCode": "INVALID_SESSION"}
    if not sess.active or is_expired(sess):
        deactivate_session(sess.session_id)
        return 200, {"success": False, "message": "Session has expired", "errorCode": "SESSION_EXPIRED"}

    refresh_session(sess.session_id)
    return 200, {"success": True, "message": "Heartbeat received", "data": {"lastSeenAt": now().isoformat(), "sessionActive": True}}
```

Deactivate (outline):
```python
def deactivate_handler(data):
    ok, err = verify_request_signature(data)
    if not ok:
        return 401, {"success": False, "message": f"Security verification failed: {err}", "errorCode": "SECURITY_ERROR"}

    lic_key, sess_id = data["licenseKey"], data["sessionId"]
    sess = get_session(sess_id)
    if not sess or sess.license_key != lic_key:
        return 200, {"success": False, "message": "Session not found or already inactive", "errorCode": "SESSION_NOT_FOUND"}

    deactivate_session(sess.session_id)
    return 200, {"success": True, "message": "Session deactivated successfully"}
```

## 6) Operational Considerations

- Rate limiting (suggested): validate 10/min per IP; heartbeat 1/4 min per session; deactivate 10/hour per license
- Logging: all security failures, license validation attempts, deactivations
- Admin tooling: view/force-deactivate sessions
- Rotation: when rotating the secret, ship a new app build and then update backend `API_SECRET`

## 7) Testing

Checklist:
- [ ] Signature verification on all endpoints
- [ ] Single active session per license enforced
- [ ] Session expires after 5 minutes of no heartbeat
- [ ] Deactivation frees the license immediately
- [ ] Errors return proper `errorCode`s

Example cURL (payload shown with placeholders; signature is generated client-side in the app):
```bash
curl -X POST https://www.signaltradingbots.com/api/license/validate \
  -H "Content-Type: application/json" -H "X-API-Key: DBOT-API-KEY-V8" \
  -d '{ "licenseKey":"DBOT-TEST-1234","deviceId":"abc","appVersion":"V8_2.11","timestamp":"2025-11-30T20:00:00Z","apiKey":"DBOT-API-KEY-V8","signature":"<hmac>" }'
```

— End of Guide —


