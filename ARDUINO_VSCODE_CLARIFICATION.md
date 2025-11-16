# Arduino Communication Clarification

## Important: Arduino doesn't communicate with VSCode

**VSCode is just a text editor** - it's where you view and edit code.

**Arduino IDE is a separate application** - it's where you upload code to Arduino.

**Backend (Node.js) communicates with Arduino** - via Serial Port (USB cable).

## Communication Flow

```
VSCode (Editor)
    ↓ (you edit code here)
Arduino IDE (Uploader)
    ↓ (uploads code to Arduino)
Arduino Hardware (ESP8266)
    ↓ (runs code, connects to WiFi)
Backend Server (Node.js)
    ↓ (sends pickup codes via Serial Port)
Arduino Hardware
    ↓ (receives codes, stores them)
User enters code
    ↓ (Arduino checks code)
Motor opens!
```

## How to Test Communication

### Method 1: Test Script (Recommended)

```bash
cd backend
node test-arduino-communication.js
```

This will:
1. Try to connect to Arduino
2. Send a test code
3. Show if communication works

### Method 2: Check Backend Logs

1. Start backend: `cd backend && npm start`
2. Look for: `[Arduino] ✅ Connected to /dev/cu.usbmodem110`
3. Generate a pickup code (submit found card)
4. Look for: `[Arduino] ✅ Sent: 1234 to BOX_1`

### Method 3: Check Arduino Serial Monitor

1. Open Arduino IDE
2. Tools → Serial Monitor (115200 baud)
3. You should see:
   - "WiFi connected!"
   - "Ready to verify codes!"
   - When code is sent: "✅ Received code from backend: 1234"

## Finding Your Arduino Port

**In Arduino IDE:**
- Tools → Port
- Shows your port (e.g., `/dev/cu.usbmodem110`)

**In Terminal:**
```bash
ls /dev/cu.* | grep -i usb
```

**Common ports:**
- `/dev/cu.usbmodem110` (Arduino 110)
- `/dev/cu.usbserial-110`
- `/dev/cu.usbmodem101`

## If Communication Fails

1. **Check port is correct** in `talkToArduino.js`
2. **Close Arduino IDE Serial Monitor** (only one program can use port)
3. **Restart backend** after closing Serial Monitor
4. **Check USB cable** (use data cable, not charge-only)
5. **Check Arduino is powered on**

## Summary

- ✅ **VSCode**: Edit code
- ✅ **Arduino IDE**: Upload code to Arduino
- ✅ **Backend (Node.js)**: Sends codes to Arduino via Serial Port
- ✅ **Arduino**: Receives codes, stores them, opens motor when code entered

