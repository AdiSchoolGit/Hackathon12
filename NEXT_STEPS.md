# Next Steps: Arduino Serial Port Setup

## The Problem
The serial port can only be used by **ONE program at a time**. You're getting "Serial port busy" because either:
- Arduino IDE Serial Monitor is open, OR
- The backend is already connected to the port

## Solution: Choose ONE Communication Method

### Option 1: Use Backend for Serial Communication (Recommended)
**The backend will handle all serial communication with Arduino.**

1. **Close Arduino IDE Serial Monitor** (if it's open)
   - In Arduino IDE, go to Tools → Serial Monitor
   - Close the Serial Monitor window

2. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

3. **The backend will:**
   - Auto-detect your Arduino at `/dev/cu.usbmodem101`
   - Send pickup codes to Arduino via Serial Port
   - Arduino will receive codes and store them

4. **To see Arduino output:**
   - You can temporarily open Serial Monitor to debug
   - But **close it before starting the backend**

### Option 2: Use Arduino IDE Serial Monitor (For Testing Only)
**Only use this for debugging, not for production.**

1. **Stop the backend server** (Ctrl+C)
2. **Open Arduino IDE Serial Monitor**
3. **You'll see Arduino messages, but backend can't send codes**

## Current Status

✅ **Arduino Port Detected:** `/dev/cu.usbmodem101`
✅ **Backend Code Updated:** Auto-detects and connects to your Arduino
⚠️ **Action Needed:** Close Serial Monitor, then start backend

## Testing the Connection

1. **Close Arduino IDE Serial Monitor**
2. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

3. **Look for this message:**
   ```
   [Arduino] ✅ Connected to /dev/cu.usbmodem101
   [Arduino] 📡 Ready to send pickup codes
   ```

4. **Test by submitting a found card** (with a box selected)
   - The backend will send the pickup code to Arduino
   - Arduino will store it and be ready to verify

## Troubleshooting

**If you still get "port busy":**
```bash
# Find what's using the port
lsof | grep usbmodem101

# Kill any processes using it
kill -9 <PID>
```

**If backend can't connect:**
- Make sure Arduino is plugged in via USB
- Check that Arduino IDE Serial Monitor is closed
- Restart the backend server

