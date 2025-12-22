# License System Specification - Session-Based Licensing

## Overview

This document specifies the complete session-based license system for the Trading Bot application. The system allows users to use their license on any Windows device, but enforces that only **one device can be active at a time** per license key.

Backend engineers: Implement endpoints exactly as described here, using the detailed steps in `BACKEND_IMPLEMENTATION.md`. That guide is the companion for server-side work and reflects the current app behavior.

## Key Features

- **Session-Based**: No hardware fingerprint binding - users can switch devices freely
- **Single Active Session**: Only one device can use a license at any given time
- **Heartbeat Monitoring**: 5-minute heartbeat interval to track active sessions
- **Automatic Expiration**: Sessions expire after 5 minutes of inactivity
- **Device Identification**: Stable device ID based on device name + MAC address hash
- **Manual Deactivation**: Users can manually deactivate sessions to switch devices

---

## System Architecture

### Flow Diagram

```
1. User starts app
   ↓
2. App checks for stored license key
   ↓
3. If found → Validate with backend (includes deviceId)
   ↓
4. Backend checks:
   - License valid & not expired?
   - Active session exists?
     - If same deviceId → Refresh session
     - If different deviceId → Error: "License in use on another device"
     - If no active session → Create new session
   ↓
5. If valid → Store sessionId, deviceId locally
   ↓
6. Start heartbeat thread (every 5 minutes)
   ↓
7. App runs normally
   ↓
8. On app close → Stop heartbeat, optionally deactivate session
```

---

## API Endpoints

### Base URL
```
https://www.signaltradingbots.com/api/license
```

### Security
All requests must be signed using HMAC-SHA256. The app includes security fields in the payload:

Required security fields (added by the app):
```json
{
  "timestamp": "2025-11-30T20:00:00Z",
  "apiKey": "DBOT-API-KEY-V8",
  "signature": "<hmac_sha256_of(timestamp+sorted_business_payload)>"
}
```

Backend must verify:
- API key matches expected value
- Timestamp within 5 minutes
- Signature matches with shared secret
See API_SECURITY_IMPLEMENTATION.md for details.

### 1. Validate License

**Endpoint:** `POST /api/license/validate`

**Request Body:**
```json
{
  "licenseKey": "DBOT-XXXX-XXXX-XXXX-XXXX",
  "deviceId": "abc123def456...",
  "appVersion": "V8_2.11",
  "timestamp": "2025-11-30T20:00:00Z",
  "apiKey": "DBOT-API-KEY-V8",
  "signature": "abc123def456..."
}
```

**Response (Success - New Session Created):**
```json
{
  "success": true,
  "message": "License validated successfully",
  "data": {
    "licenseKey": "DBOT-XXXX-XXXX-XXXX-XXXX",
    "sessionId": "SESSION-ABC123XYZ",
    "deviceId": "abc123def456...",
    "status": "active",
    "plan": "yearly",
    "expiresAt": "2026-11-30T00:00:00Z",
    "daysRemaining": 365,
    "email": "customer@example.com",
    "createdAt": "2025-11-30T20:00:00Z"
  }
}
```

**Response (Success - Existing Session Refreshed):**
```json
{
  "success": true,
  "message": "Session refreshed",
  "data": {
    "licenseKey": "DBOT-XXXX-XXXX-XXXX-XXXX",
    "sessionId": "SESSION-ABC123XYZ",
    "deviceId": "abc123def456...",
    "status": "active",
    "expiresAt": "2026-11-30T00:00:00Z",
    "daysRemaining": 365,
    "lastSeenAt": "2025-11-30T20:00:00Z"
  }
}
```

**Response (Error - License in Use):**
```json
{
  "success": false,
  "message": "License is already active on another device",
  "errorCode": "LICENSE_IN_USE",
  "data": {
    "activeDeviceId": "xyz789...",
    "lastSeenAt": "2025-11-30T19:55:00Z"
  }
}
```

**Response (Error - License Expired):**
```json
{
  "success": false,
  "message": "License has expired",
  "errorCode": "LICENSE_EXPIRED",
  "data": {}
}
```

**Response (Error - Invalid License):**
```json
{
  "success": false,
  "message": "Invalid license key",
  "errorCode": "INVALID_LICENSE",
  "data": {}
}
```

**Backend Validation Logic:**
1. Check if license key exists in database
2. Verify license status is "active"
3. Check if license is expired (expiresAt > current date)
4. Check for active sessions:
   - If active session exists with same deviceId → Refresh session (update last_seen_at)
   - If active session exists with different deviceId → Return "LICENSE_IN_USE" error
   - If no active session or session expired (>5 min) → Create new session
5. Return session details

---

### 2. Heartbeat

**Endpoint:** `POST /api/license/heartbeat`

**Request Body:**
```json
{
  "licenseKey": "DBOT-XXXX-XXXX-XXXX-XXXX",
  "sessionId": "SESSION-ABC123XYZ",
  "deviceId": "abc123def456...",
  "timestamp": "2025-11-30T20:05:00Z",
  "apiKey": "DBOT-API-KEY-V8",
  "signature": "abc123def456..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Heartbeat received",
  "data": {
    "lastSeenAt": "2025-11-30T20:05:00Z",
    "sessionActive": true
  }
}
```

**Response (Error - Session Expired):**
```json
{
  "success": false,
  "message": "Session has expired",
  "errorCode": "SESSION_EXPIRED",
  "data": {}
}
```

**Response (Error - Invalid Session):**
```json
{
  "success": false,
  "message": "Invalid session",
  "errorCode": "INVALID_SESSION",
  "data": {}
}
```

**Backend Logic:**
1. Validate sessionId exists and is active
2. Verify deviceId matches session
3. Update last_seen_at timestamp
4. Check if session expired (>5 minutes since last_seen_at)
5. Return success or error

**Frequency:** App sends heartbeat every 5 minutes while running

---

### 3. Deactivate Session

**Endpoint:** `POST /api/license/deactivate`

**Request Body:**
```json
{
  "licenseKey": "DBOT-XXXX-XXXX-XXXX-XXXX",
  "sessionId": "SESSION-ABC123XYZ",
  "timestamp": "2025-11-30T20:10:00Z",
  "apiKey": "DBOT-API-KEY-V8",
  "signature": "abc123def456..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Session deactivated successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Session not found or already inactive",
  "errorCode": "SESSION_NOT_FOUND"
}
```

**Backend Logic:**
1. Find session by sessionId and licenseKey
2. Mark session as inactive (active = false)
3. License is now free for use on another device
4. Return success

---

## Database Schema

### licenses Table

```sql
CREATE TABLE licenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    license_key VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    plan VARCHAR(20) NOT NULL,  -- 'monthly', 'yearly', 'lifetime'
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    payment_id VARCHAR(100),
    amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    INDEX idx_license_key (license_key),
    INDEX idx_email (email),
    INDEX idx_status (status)
);
```

### license_sessions Table

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

**Session Management Rules:**
- Only one active session per license_key at any time
- Sessions expire after 5 minutes of inactivity (last_seen_at < NOW() - INTERVAL 5 MINUTE)
- When creating new session, deactivate any existing active sessions for the same license
- device_id should be unique per physical device (hash of device name + MAC)

---

## Device ID Generation

### Algorithm

The device ID is generated using a combination of:
1. **Device Name** (hostname): `platform.node()`
2. **MAC Address**: Primary network adapter MAC address

**Python Implementation:**
```python
import hashlib
import platform
import uuid

def generate_device_id():
    device_name = platform.node()
    mac = uuid.getnode()
    mac_str = ':'.join(('%012X' % mac)[i:i+2] for i in range(0, 12, 2))
    combined = f"{device_name}-{mac_str}"
    device_id = hashlib.sha256(combined.encode()).hexdigest()
    return device_id
```

**Properties:**
- Stable: Same device always generates same ID
- Unique: Different devices generate different IDs
- VPN-Proof: MAC address is not affected by VPN
- Persistent: Stored in license.json for reuse

---

## App-Side Implementation

### Local Storage (license.json)

**File Location:**
- **Windows:** `%LOCALAPPDATA%\SignalTradingBots\config\license.json`
- **Full Path Example:** `C:\Users\[Username]\AppData\Local\SignalTradingBots\config\license.json`
- **Note:** Saved in user data directory to persist between EXE runs

**File Structure:**
```json
{
  "license_key": "DBOT-XXXX-XXXX-XXXX-XXXX",
  "device_id": "abc123def456...",
  "session_id": "SESSION-ABC123XYZ",
  "stored_at": "2025-11-30T20:00:00Z",
  "last_heartbeat": "2025-11-30T20:05:00Z",
  "license_data": {
    "status": "active",
    "plan": "yearly",
    "expiresAt": "2026-11-30T00:00:00Z",
    "daysRemaining": 365,
    "email": "customer@example.com"
  }
}
```

### Heartbeat Thread

- Runs in background thread
- Sends heartbeat every 5 minutes
- Updates `last_heartbeat` in license.json on success
- Handles network errors gracefully (retry on next interval)
- Stops when app closes or session deactivated

### Session Validation Flow

1. **On App Startup:**
   - Load license.json if exists
   - Extract license_key, device_id, session_id
   - Call `/api/license/validate` with device_id
   - If valid → Start heartbeat thread
   - If invalid → Show license dialog

2. **During Runtime:**
   - Heartbeat thread sends periodic updates
   - If heartbeat fails with SESSION_EXPIRED → Show error, require re-validation

3. **On App Shutdown:**
   - Stop heartbeat thread
   - Optionally call `/api/license/deactivate` (or let it expire naturally)

---

## Error Handling

### Common Error Scenarios

1. **License in Use on Another Device**
   - Message: "License is already active on another device. Please deactivate the session on the other device first."
   - Action: Show deactivation option or wait for expiration

2. **Session Expired**
   - Message: "Your session has expired. Please re-validate your license."
   - Action: Re-run validation flow

3. **Network Error During Heartbeat**
   - Action: Retry on next heartbeat interval (5 minutes)
   - Don't block app functionality
   - Log warning if multiple failures

4. **License Expired**
   - Message: "Your license has expired. Please renew your subscription."
   - Action: Show renewal options

5. **Invalid License Key**
   - Message: "Invalid license key. Please check and try again."
   - Action: Allow re-entry

---

## Security Considerations

1. **Session Token Security**
   - Generate cryptographically secure random session IDs
   - Minimum 32 characters, alphanumeric + special chars
   - Store securely on backend, never expose in logs

2. **Rate Limiting**
   - Limit validation attempts: 5 per minute per IP
   - Limit heartbeat: 1 per 4 minutes per session (prevent abuse)
   - Limit deactivation: 10 per hour per license

3. **Session Hijacking Prevention**
   - Validate device_id matches on every request
   - Include timestamp in requests (prevent replay attacks)
   - Use HTTPS only for all API calls

4. **Admin Override**
   - Backend should allow admins to force-deactivate sessions
   - Log all admin actions for audit trail

---

## Testing Scenarios

### Test Case 1: First Time Activation
1. User enters license key
2. Backend creates new session
3. App stores session_id and device_id
4. Heartbeat starts
5. ✅ App runs normally

### Test Case 2: Same Device Reconnection
1. User closes app
2. User reopens app (same device)
3. App loads stored license.json
4. Backend recognizes same device_id
5. Backend refreshes existing session
6. ✅ App runs without re-prompting

### Test Case 3: Different Device Attempt
1. User has active session on Device A
2. User tries to activate on Device B (same license)
3. Backend detects different device_id
4. Backend returns "LICENSE_IN_USE" error
5. ✅ App shows error message

### Test Case 4: Session Expiration
1. User has active session
2. App crashes (no graceful shutdown)
3. Heartbeat stops
4. After 5 minutes, session expires
5. User can now activate on another device
6. ✅ License freed automatically

### Test Case 5: Manual Deactivation
1. User clicks "Deactivate Session" in app
2. App calls `/api/license/deactivate`
3. Backend marks session inactive
4. ✅ License freed for another device

### Test Case 6: Heartbeat Failure Recovery
1. Network error during heartbeat
2. App retries on next interval (5 min)
3. If session expired → Re-validate
4. ✅ Graceful error handling

---

## Backend Implementation Checklist

- [ ] Create database tables (licenses, license_sessions)
- [ ] Implement `/api/license/validate` endpoint
- [ ] Implement `/api/license/heartbeat` endpoint
- [ ] Implement `/api/license/deactivate` endpoint
- [ ] Add session expiration cleanup job (runs every minute)
- [ ] Add rate limiting middleware
- [ ] Add logging for all license operations
- [ ] Add admin panel for license management
- [ ] Add email notifications for license events
- [ ] Add payment webhook integration (for license generation)

---

## Migration from Hardware Fingerprint

For existing licenses with hardware fingerprint:
1. On first validation with new system, ignore hardware fingerprint
2. Create new session-based entry
3. Old hardware-bound licenses will work but won't enforce single device
4. Recommend users re-activate to get session-based benefits

---

## Support and Troubleshooting

### User Issues

**"License in use on another device"**
- Solution: Deactivate session on other device or wait 5 minutes

**"Session expired"**
- Solution: Re-validate license (automatic on next app start)

**"Can't switch devices"**
- Solution: Ensure old device is closed or deactivated

### Admin Tools

- View all active sessions
- Force deactivate sessions
- View license usage history
- Export license reports

---

## Version History

- **v2.0** (Current): Session-based licensing with heartbeat
- **v1.0** (Deprecated): Hardware fingerprint-based licensing

---

*Last Updated: 2025-11-30*

