# Arduino Upload Guide - Step by Step

## What is Arduino IDE?

**Arduino IDE is a SEPARATE application from VSCode.** You need to:
1. Download and install Arduino IDE from: https://www.arduino.cc/en/software
2. Open Arduino IDE (not VSCode)
3. Copy the code from `arduino_final_code.ino` into Arduino IDE
4. Upload from Arduino IDE

## Fixing Upload Errors

The error `avrdude: stk500_getsync() not in sync` usually means:
- Wrong board type selected
- Wrong port selected
- Board not responding
- Need to install board support

## Step-by-Step Setup

### Step 1: Install Arduino IDE

1. **Download Arduino IDE:**
   - Go to: https://www.arduino.cc/en/software
   - Download for macOS
   - Install the application

2. **Open Arduino IDE** (not VSCode!)

### Step 2: Install ESP8266 Board Support

Since your code uses `ESP8266WiFi.h`, you need ESP8266 board support:

1. **Open Arduino IDE**
2. **Go to:** Arduino → Preferences (or Arduino IDE → Settings)
3. **Find "Additional Boards Manager URLs"**
4. **Add this URL:**
   ```
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
5. **Click OK**

6. **Install ESP8266 Board:**
   - Go to: Tools → Board → Boards Manager
   - Search for: "ESP8266"
   - Install: "esp8266 by ESP8266 Community" (version 3.x.x)
   - Wait for installation to complete

### Step 3: Select Correct Board

1. **Go to:** Tools → Board
2. **Select:** ESP8266 Boards → NodeMCU 1.0 (ESP-12E Module)
   - OR: "Generic ESP8266 Module" if NodeMCU not available
   - OR: Your specific ESP8266 board model

### Step 4: Select Correct Port

1. **Connect your ESP8266/ESP32 to computer via USB**
2. **Go to:** Tools → Port
3. **Select the port:**
   - macOS: Usually `/dev/cu.usbmodem101` or `/dev/cu.SLAB_USBtoUART`
   - Look for "USB" or "Serial" in the name
   - If you don't see it, unplug and replug the USB cable

### Step 5: Copy Code to Arduino IDE

1. **Open `arduino_final_code.ino` in a text editor** (or VSCode to view)
2. **Copy ALL the code**
3. **Open Arduino IDE**
4. **Create a new sketch:** File → New
5. **Delete the default code**
6. **Paste your code**

### Step 6: Update Settings in Code

Before uploading, update these in the code:

```cpp
// Line 21-22: Update WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";        // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD"; // Your WiFi password

// Line 25: Update server IP (if needed)
const char* serverUrl = "http://10.130.55.25:4000";  // Your computer's IP

// Line 26: Update box ID (if needed)
const String boxId = "BOX_1";  // Your box identifier
```

### Step 7: Upload Code

1. **Click the Upload button** (→ arrow icon) in Arduino IDE
2. **If you get errors, try:**
   - Press and hold the RESET button on your ESP8266
   - While holding RESET, click Upload
   - Release RESET when "Connecting..." appears
   - Wait for upload to complete

### Step 8: Open Serial Monitor

1. **After successful upload:**
   - Click the Serial Monitor icon (magnifying glass) in Arduino IDE
   - Set baud rate to: **115200** (bottom right)
   - You should see: "WiFi connected!" and "Ready to verify codes!"

## Troubleshooting Upload Errors

### Error: "stk500_getsync() not in sync"

**Solution 1: Check Board Selection**
- Make sure you selected ESP8266 board (not Arduino Uno)
- Tools → Board → ESP8266 Boards → NodeMCU 1.0

**Solution 2: Check Port**
- Tools → Port → Select the correct USB port
- If port doesn't appear, unplug/replug USB cable

**Solution 3: Manual Reset**
- Press and hold RESET button on ESP8266
- Click Upload in Arduino IDE
- Release RESET when "Connecting..." appears

**Solution 4: Install Drivers**
- Some ESP8266 boards need USB drivers
- Check your board manufacturer's website
- Common drivers: CH340, CP2102, FTDI

**Solution 5: Check USB Cable**
- Use a data cable (not charge-only cable)
- Try a different USB port
- Try a different cable

### Error: "Board not found"

- Install ESP8266 board support (Step 2 above)
- Restart Arduino IDE after installation

### Error: "Port not found"

- Unplug and replug USB cable
- Check Tools → Port menu
- On macOS, try: `/dev/cu.usbserial-*` or `/dev/cu.SLAB_USBtoUART`

## Quick Checklist

Before uploading:
- [ ] Arduino IDE installed (not VSCode!)
- [ ] ESP8266 board support installed
- [ ] Correct board selected (ESP8266, not Arduino Uno)
- [ ] Correct port selected
- [ ] USB cable connected
- [ ] WiFi credentials updated in code
- [ ] Server IP updated in code
- [ ] Serial Monitor closed (if open)

## Alternative: Using VSCode with Arduino Extension

If you prefer VSCode:

1. **Install Arduino Extension:**
   - Open VSCode
   - Extensions → Search "Arduino"
   - Install "Arduino" by Microsoft

2. **Configure:**
   - Still need Arduino IDE installed (for compiler)
   - Extension uses Arduino IDE in background

3. **Upload:**
   - Use VSCode Arduino extension
   - Select board and port in extension
   - Click Upload

**But for beginners, Arduino IDE is recommended!**

## Next Steps After Successful Upload

1. **Close Serial Monitor** (important for backend connection)
2. **Start backend:** `cd backend && npm start`
3. **Generate a pickup code** (submit found card)
4. **Open Serial Monitor again** (115200 baud) to see received codes
5. **Enter code** → Motor should open!

