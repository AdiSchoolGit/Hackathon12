# Arduino Integration Guide - Complete Setup

## How It Works

### 1. Code Flow

```
Backend generates pickup code
    ↓
Backend sends to Arduino via Serial: "CODE:1234:BOX_1\n"
    ↓
Arduino receives and stores code in memory
    ↓
User enters code on Arduino (via keypad/Serial Monitor)
    ↓
Arduino checks:
  1. Is code in stored list? ✅
  2. Verify with backend via WiFi ✅
    ↓
If valid → Motor opens for 10 seconds
```

### 2. Two Communication Methods

**Serial Port (USB):**
- Backend → Arduino: Sends pickup codes when generated
- Format: `CODE:1234:BOX_1\n`
- Baud rate: 9600 (for Serial Monitor) or 115200 (for ESP8266)

**WiFi (HTTP):**
- Arduino → Backend: Verifies codes when user enters them
- Endpoint: `POST /api/pickup-request`
- Also polls: `GET /api/arduino/check-open` for web app requests

## Setup Steps

### Step 1: Upload Arduino Code

1. Open `arduino_final_code.ino` in Arduino IDE
2. Update these settings:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* serverUrl = "http://10.130.55.25:4000";  // Your computer's IP
   const String boxId = "BOX_1";  // Your box ID
   ```
3. Upload to your ESP8266/ESP32

### Step 2: Connect Arduino to Computer

1. Connect Arduino via USB cable
2. Note the port (check Arduino IDE: Tools > Port)
3. Common ports:
   - macOS: `/dev/cu.usbmodem101` or `/dev/cu.usbserial-110`
   - Linux: `/dev/ttyUSB0` or `/dev/ttyACM0`
   - Windows: `COM3` or `COM4`

### Step 3: Start Backend

1. **Close Arduino IDE Serial Monitor** (important!)
2. Start backend:
   ```bash
   cd backend
   npm start
   ```
3. Look for:
   ```
   [Arduino] ✅ Connected to /dev/cu.usbmodem101
   [Arduino] 📡 Ready to send pickup codes
   ```

### Step 4: Test

1. **Generate a pickup code:**
   - Submit a found card with a box selected
   - Check backend logs: `[Arduino] ✅ Sent: 1234 to BOX_1`

2. **Check Arduino Serial Monitor (115200 baud):**
   - Should see: `✅ Received code from backend: 1234`
   - Should see: `📦 Stored code: 1234`
   - Should see: `Total codes: 1`

3. **Enter code on Arduino:**
   - Type code: `1234` (via Serial Monitor or keypad)
   - Should see: `✅ Code found in stored list!`
   - Should see: `✅ Code verified by backend. Opening...`
   - Motor should open for 10 seconds

## Troubleshooting

### Motor Not Opening

**Check 1: Is code being received?**
- Open Arduino Serial Monitor (115200 baud)
- Generate a pickup code
- Should see: `✅ Received code from backend: 1234`
- If not: Check serial port connection

**Check 2: Is code stored?**
- Should see: `📦 Stored code: 1234`
- Should see: `Total codes: 1`
- If not: Check code format parsing

**Check 3: Is code being verified?**
- Enter code on Arduino
- Should see: `✅ Code found in stored list!`
- Should see: `✅ Code verified by backend. Opening...`
- If not: Check WiFi connection and backend URL

**Check 4: Is motor function called?**
- Should see: `Door open for 10 seconds.`
- Check servo pin connection (pin 6)
- Check servo positions (OPEN_POS = 90, CLOSED_POS = 0)

### Serial Port Issues

**"Port is locked" error:**
- Close Arduino IDE Serial Monitor
- Close any other programs using the port
- Restart backend

**"No Arduino port found":**
- Check USB connection
- Check port path in `talkToArduino.js`
- Try: `ls /dev/cu.*` to find your port

### WiFi Issues

**"WiFi connection failed":**
- Check SSID and password
- For eduroam: May need username format
- Check WiFi signal strength

**"Connection failed" when verifying:**
- Check backend server is running
- Check IP address is correct
- Check Arduino and computer on same network

## Code Storage

The Arduino stores up to 20 pickup codes in memory. When a code is:
- ✅ Received from backend → Stored automatically
- ✅ Entered by user → Verified against stored list AND backend
- ✅ Valid → Motor opens

**Offline Mode:**
If backend is unreachable but code is in stored list, Arduino will still open the motor (for reliability).

## Testing Checklist

- [ ] Arduino code uploaded successfully
- [ ] WiFi connected (check Serial Monitor)
- [ ] Backend running and Arduino port connected
- [ ] Pickup code generated → Received on Arduino
- [ ] Code stored in Arduino memory
- [ ] Code entered → Motor opens
- [ ] Motor closes after 10 seconds

## Next Steps

1. Test with actual keypad/buttons (if using physical input)
2. Adjust servo positions if needed (OPEN_POS, CLOSED_POS)
3. Adjust open time if needed (OPEN_TIME)
4. Test with multiple codes
5. Test web app → Arduino flow (polling for open requests)

