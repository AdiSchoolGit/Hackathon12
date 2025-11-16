# Arduino Motor Not Working - Quick Fix

## Issue
Motor not opening when pickup code is entered.

## Solution: Hardcoded Pickup Code

✅ **Pickup code is now hardcoded to `1134`**

Every time a card is found with a box, the pickup code will be `1134`.

## Steps to Test

1. **Close Arduino IDE Serial Monitor** (if open)
   - This blocks the serial port

2. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

3. **Look for this message:**
   ```
   [Arduino] ✅ Connected to /dev/cu.usbmodem101
   [Arduino] 📡 Ready to send pickup codes
   ```

4. **Submit a found card** (with a box selected)
   - Backend will send code `1134` to Arduino
   - Arduino will store it

5. **Test the pickup code:**
   - Go to "Retrieve Card" page
   - Enter your reference code
   - Enter pickup code: `1134`
   - Motor should open!

## Arduino Code Update Needed

Make sure your Arduino code accepts `1134` as a valid code. The backend will:
- Always generate `1134` as the pickup code
- Send it to Arduino via Serial Port
- Store it in Arduino's memory

## Troubleshooting

**If motor still doesn't work:**
1. Check Arduino Serial Monitor (close it first, then open briefly to debug)
2. Verify servo is connected to pin 6
3. Check that `OPEN_POS = 90` and `CLOSED_POS = 0` are correct for your servo
4. Make sure Arduino code is uploaded with correct WiFi credentials

**If backend can't connect:**
- Close Arduino IDE Serial Monitor
- Restart backend: `npm start`

