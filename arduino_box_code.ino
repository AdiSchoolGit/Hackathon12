/*
 * Clumsy Aztecs - Arduino Box Controller
 * Verifies pickup codes via WiFi and controls servo lock
 *
 * Hardware:
 * - ESP8266 or ESP32 (WiFi-enabled Arduino)
 * - Servo motor on pin 6 (or your servo pin)
 * - Optional: 4-button keypad for code entry
 *
 * Setup:
 * 1. Install ESP8266 board support in Arduino IDE
 * 2. Install libraries: ESP8266WiFi, HTTPClient, Servo
 * 3. Update WiFi credentials and server IP below
 * 4. Upload to your board
 */

#include <ESP8266WiFi.h>  // For ESP8266
// #include <WiFi.h>      // For ESP32 (uncomment if using ESP32)
// #include <Servo.h>     // Uncomment if using Servo library

#include <HTTPClient.h>
#include <ArduinoJson.h>  // Install from Library Manager

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend server (replace with your computer's IP address)
const char* serverUrl = "http://10.130.55.25:4000";  // UPDATE THIS!
const String boxId = "BOX_1";  // Your box identifier

// Servo configuration
// Servo lockServo;  // Uncomment if using Servo library
const int SERVO_PIN = 6;
const int OPEN_POS = 90;    // Adjust depending on your mechanism
const int CLOSED_POS = 0;   // Adjust depending on your mechanism
const int OPEN_TIME = 15000; // 15 seconds (in milliseconds)

// Code entry
String inputCode = "";
const int MAX_CODE_LENGTH = 4;

// Optional: Button pins for keypad (if using physical buttons)
// const int BUTTON_1 = D1;
// const int BUTTON_2 = D2;
// const int BUTTON_3 = D3;
// const int BUTTON_4 = D4;

WiFiClient client;
HTTPClient http;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize servo
  // lockServo.attach(SERVO_PIN);  // Uncomment if using Servo library
  // lockServo.write(CLOSED_POS);

  // For ESP8266, use digitalWrite if not using Servo library
  pinMode(SERVO_PIN, OUTPUT);
  closeDoor();

  // Optional: Initialize button pins
  // pinMode(BUTTON_1, INPUT_PULLUP);
  // pinMode(BUTTON_2, INPUT_PULLUP);
  // pinMode(BUTTON_3, INPUT_PULLUP);
  // pinMode(BUTTON_4, INPUT_PULLUP);

  // Connect to WiFi
  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Server URL: ");
    Serial.println(serverUrl);
    Serial.println("Ready to verify codes!");
    Serial.println("Enter 4-digit code (digits 1-4 only):");
  } else {
    Serial.println();
    Serial.println("WiFi connection failed!");
    Serial.println("Check your credentials and try again.");
  }
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    WiFi.begin(ssid, password);
    delay(5000);
    return;
  }

  // Method 1: Read from Serial Monitor (for testing)
  if (Serial.available()) {
    char c = Serial.read();

    // Only accept digits 1, 2, 3, 4
    if (c >= '1' && c <= '4') {
      if (inputCode.length() < MAX_CODE_LENGTH) {
        inputCode += c;
        Serial.print("*");  // Show asterisk for each digit
      }
    }
    // If user presses enter or code is complete
    else if (c == '\n' || c == '\r' || inputCode.length() == MAX_CODE_LENGTH) {
      if (inputCode.length() == MAX_CODE_LENGTH) {
        Serial.println();
        Serial.print("Verifying code: ");
        Serial.println(inputCode);
        checkCode(inputCode);
        inputCode = "";
        Serial.println("Enter code:");
      }
    }
    // Clear on backspace or invalid character
    else if (c == '\b' || c == 127) {
      if (inputCode.length() > 0) {
        inputCode = inputCode.substring(0, inputCode.length() - 1);
        Serial.print("\b \b");
      }
    }
  }

  // Method 2: Read from physical buttons (uncomment if using buttons)
  /*
  if (digitalRead(BUTTON_1) == LOW) {
    addDigit('1');
    delay(300);  // Debounce
  }
  if (digitalRead(BUTTON_2) == LOW) {
    addDigit('2');
    delay(300);
  }
  if (digitalRead(BUTTON_3) == LOW) {
    addDigit('3');
    delay(300);
  }
  if (digitalRead(BUTTON_4) == LOW) {
    addDigit('4');
    delay(300);
  }
  */

  delay(50);
}

void addDigit(char digit) {
  if (inputCode.length() < MAX_CODE_LENGTH) {
    inputCode += digit;
    Serial.print(digit);

    if (inputCode.length() == MAX_CODE_LENGTH) {
      Serial.println();
      Serial.print("Verifying code: ");
      Serial.println(inputCode);
      checkCode(inputCode);
      inputCode = "";
      Serial.println("Enter code:");
    }
  }
}

void checkCode(String code) {
  Serial.print("Connecting to server... ");

  String url = String(serverUrl) + "/api/pickup-request";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  String jsonPayload = "{\"pickupCode\":\"" + code + "\",\"boxId\":\"" + boxId + "\"}";
  Serial.println("Sending: " + jsonPayload);

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    String response = http.getString();
    Serial.println("Response: " + response);

    // Parse response
    if (httpResponseCode == 200) {
      // Check if response contains "ok":true
      if (response.indexOf("\"ok\":true") > 0) {
        Serial.println("✅ Code accepted! Opening door...");
        openDoor();
      } else {
        Serial.println("❌ Invalid code.");
      }
    } else {
      Serial.print("❌ Server error: ");
      Serial.println(httpResponseCode);
    }
  } else {
    Serial.print("❌ Connection failed. Error code: ");
    Serial.println(httpResponseCode);
    Serial.println("Check:");
    Serial.println("  1. Server is running");
    Serial.println("  2. IP address is correct");
    Serial.println("  3. Arduino and computer are on same WiFi");
  }

  http.end();
}

void openDoor() {
  Serial.println("Opening door...");

  // If using Servo library:
  // lockServo.write(OPEN_POS);

  // If using digitalWrite (for simple servo control):
  // You may need to use PWM or a servo library
  // For now, using Servo library is recommended

  // For testing without servo, just print
  Serial.println("Door would open for 15 seconds...");

  delay(OPEN_TIME);

  Serial.println("Closing door.");
  closeDoor();
}

void closeDoor() {
  // If using Servo library:
  // lockServo.write(CLOSED_POS);

  Serial.println("Door closed.");
}

