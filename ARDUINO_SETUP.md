# Arduino WiFi Setup Guide

## Backend Configuration

The backend is now configured to:
- ✅ Generate pickup codes using only digits **1, 2, 3, 4** (e.g., "1234", "4321", "2244")
- ✅ Accept connections from Arduino devices via WiFi
- ✅ Listen on all network interfaces (accessible from your local network)

## Find Your Computer's IP Address

Run this command to find your IP:

```bash
# Mac/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or:
ipconfig getifaddr en0
```

Look for something like `192.168.1.xxx` or `10.0.0.xxx`

## Arduino Code

### Required Libraries
- ESP8266WiFi (for ESP8266) or WiFi (for ESP32)
- HTTPClient (usually included)

### Basic Setup

```cpp
#include <ESP8266WiFi.h>  // For ESP8266
// #include <WiFi.h>      // For ESP32 (uncomment if using ESP32)

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://192.168.1.XXX:4000";  // Replace XXX with your IP
const String boxId = "BOX_1";  // Your box identifier

WiFiClient client;
HTTPClient http;
```

### Verify Pickup Code Function

```cpp
bool validatePickupCode(String pickupCode) {
    http.begin(client, String(serverUrl) + "/api/pickup-request");
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\"pickupCode\":\"" + pickupCode + "\",\"boxId\":\"" + boxId + "\"}";

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode == 200) {
        String response = http.getString();
        http.end();

        // Check if response contains "ok":true
        if (response.indexOf("\"ok\":true") > 0) {
            return true;
        }
    }

    http.end();
    return false;
}
```

### API Endpoints

1. **Verify Pickup Code:**
   - `POST /api/pickup-request`
   - Body: `{"pickupCode": "1234", "boxId": "BOX_1"}`
   - Response: `{"ok": true, "message": "..."}` or `{"ok": false, "reason": "..."}`

2. **Report Found Card (if using camera/scanner):**
   - `POST /api/found-card-redid`
   - Body: `{"redId": "132264610", "boxId": "BOX_1"}`
   - Response: `{"cardId": "...", "pickupCode": "1234"}`

## Testing

1. Make sure your computer and Arduino are on the same WiFi network
2. Update the `serverUrl` in Arduino code with your computer's IP
3. Upload code to Arduino
4. Test by sending a pickup code (e.g., "1234")
5. Check Serial Monitor for responses

## Pickup Code Format

- **Length:** 4 digits
- **Allowed digits:** Only 1, 2, 3, 4
- **Examples:** "1234", "4321", "1122", "3344", "2143"

## Troubleshooting

- **Can't connect:** Check firewall settings, allow port 4000
- **Connection refused:** Make sure backend is running and listening on 0.0.0.0
- **Invalid code:** Verify the code was generated correctly (only 1-4 digits)

