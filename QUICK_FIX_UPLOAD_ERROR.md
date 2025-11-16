# Quick Fix: Upload Error "stk500_getsync() not in sync"

## The Problem

You're getting this error because Arduino IDE thinks you're uploading to an **Arduino Uno** (or similar), but your code is for **ESP8266**.

## Quick Fix (3 Steps)

### 1. Install ESP8266 Board Support

In Arduino IDE:
1. **File → Preferences**
2. **Paste this in "Additional Boards Manager URLs":**
   ```
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
3. **Click OK**

4. **Tools → Board → Boards Manager**
5. **Search:** "ESP8266"
6. **Install:** "esp8266 by ESP8266 Community"
7. **Wait for installation** (may take a few minutes)

### 2. Select ESP8266 Board

1. **Tools → Board**
2. **Select:** "ESP8266 Boards" → "NodeMCU 1.0 (ESP-12E Module)"
   - If you don't see NodeMCU, select "Generic ESP8266 Module"

### 3. Select Correct Port

1. **Connect ESP8266 via USB**
2. **Tools → Port**
3. **Select the port** (usually `/dev/cu.usbmodem*` or `/dev/cu.SLAB*`)

### 4. Upload Again

1. **Click Upload button** (→ arrow)
2. **If still fails:**
   - Press and hold **RESET** button on ESP8266
   - Click **Upload**
   - Release **RESET** when you see "Connecting..."

## What Board Do You Have?

Check your physical board:
- **ESP8266** (NodeMCU, Wemos D1, etc.) → Use ESP8266 board
- **ESP32** → Need ESP32 board support (different setup)
- **Arduino Uno/Nano** → Won't work with this code (needs WiFi shield)

## Still Not Working?

1. **Check USB cable** - Use data cable, not charge-only
2. **Try different USB port**
3. **Install USB drivers** (CH340, CP2102, or FTDI)
4. **Check board model** - Make sure it's ESP8266 or ESP32

