# Arduino Serial Communication Setup

## Overview

The backend now automatically sends pickup codes to Arduino via Serial Port when they are generated. The system:

1. **Stores all pickup codes** when generated
2. **Sends codes to Arduino** via Serial Port in format: `CODE:1234:BOX_1\n`
3. **Sends all stored codes** when Arduino connects
4. **Handles connection errors gracefully** (won't crash if Arduino isn't connected)

## Backend Configuration

### Serial Port Path

The default port path is `/dev/cu.usbmodem101` (macOS). To change it:

1. Find your Arduino port:
   ```bash
   # macOS/Linux
   ls /dev/cu.* /dev/tty.* | grep -i usb

   # Or check Arduino IDE: Tools > Port
   ```

2. Update `backend/src/talkToArduino.js`:
   ```javascript
   const commonPorts = [
       '/dev/cu.usbmodem101',  // Change this to your port
       // ...
   ];
   ```

   Or call `initializeArduinoConnection('/dev/your-port')` manually.

## Arduino Code Updates

Your Arduino needs to receive codes in this format:
```
CODE:1234:BOX_1
```

### Example Arduino Code

Add this to your Arduino `loop()` function:

```cpp
void loop() {
  // ... existing code ...

  // Check for incoming serial data
  if (Serial.available() > 0) {
    String message = Serial.readStringUntil('\n');
    message.trim();

    // Parse format: "CODE:1234:BOX_1"
    if (message.startsWith("CODE:")) {
      int codeStart = 5; // After "CODE:"
      int codeEnd = message.indexOf(':', codeStart);

      if (codeEnd > codeStart) {
        String pickupCode = message.substring(codeStart, codeEnd);
        String boxId = message.substring(codeEnd + 1);

        Serial.print("Received code: ");
        Serial.print(pickupCode);
        Serial.print(" for box: ");
        Serial.println(boxId);

        // Store the code or add to your code list
        // You can add it to an array of valid codes
        addValidCode(pickupCode, boxId);
      }
    }
  }

  // ... rest of your code ...
}

// Example function to store valid codes
void addValidCode(String code, String box) {
  // Add to your code storage system
  // This depends on your Arduino implementation
}
```

## How It Works

1. **When a pickup code is generated:**
   - Backend calls `sendPickupCodeToArduino(pickupCode, boxId, cardId)`
   - Code is stored in memory
   - If Arduino is connected, code is sent immediately
   - If not connected, code is queued

2. **When Arduino connects:**
   - Backend detects connection
   - Sends all stored codes (one every 500ms)
   - Arduino receives and stores them

3. **Code Format:**
   ```
   CODE:1234:BOX_1\n
   ```
   - `CODE:` - Prefix
   - `1234` - The pickup code (4 digits, 1-4)
   - `BOX_1` - The box ID
   - `\n` - Newline terminator

## Testing

1. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Check logs:**
   - Look for `[Arduino] ✅ Connected to /dev/...`
   - Or `[Arduino] ⚠️ No Arduino port found`

3. **Generate a pickup code:**
   - Submit a found card with a box selected
   - Check backend logs for: `[Arduino] ✅ Sent: 1234 to BOX_1`

4. **Check Arduino Serial Monitor:**
   - Open Arduino IDE Serial Monitor (9600 baud)
   - You should see: `Received code: 1234 for box: BOX_1`

## Troubleshooting

### "No Arduino port found"
- Arduino not connected
- Wrong port path
- Port already in use (close Arduino IDE Serial Monitor)

### "Error opening port"
- Port doesn't exist
- Permission denied (may need to run with sudo on Linux)
- Port already in use

### Codes not received
- Check baud rate matches (9600)
- Verify port path is correct
- Make sure Arduino Serial Monitor is closed
- Check Arduino code is listening for serial input

## Manual Port Configuration

To manually set the port, you can call:

```javascript
import { initializeArduinoConnection } from './talkToArduino.js';

initializeArduinoConnection('/dev/cu.usbmodem1101');
```

Or add to your `.env`:
```
ARDUINO_PORT=/dev/cu.usbmodem1101
```

Then update `talkToArduino.js` to read from environment variable.

