/**
 * Test script for Arduino serial communication
 * Run: node test-arduino.js
 */

import {
    sendPickupCodeToArduino,
    initializeArduinoConnection,
    getAllStoredCodes,
    sendAllStoredCodes
} from './src/talkToArduino.js';

console.log('🧪 Testing Arduino Serial Communication...\n');

// Test 1: Check if module loads
console.log('✅ Module loaded successfully\n');

// Test 2: Try to initialize connection
console.log('📡 Attempting to connect to Arduino...');
const connected = initializeArduinoConnection();

if (connected) {
    console.log('✅ Connection initialized (will connect when Arduino is available)\n');
} else {
    console.log('⚠️  Connection not initialized (Arduino may not be connected)\n');
}

// Test 3: Send a test pickup code
console.log('📦 Sending test pickup code: 1234 to BOX_1...');
sendPickupCodeToArduino('1234', 'BOX_1', 'test-card-123');

// Wait a moment
setTimeout(() => {
    console.log('\n📋 Stored codes:');
    const codes = getAllStoredCodes();
    console.log(JSON.stringify(codes, null, 2));

    console.log('\n✅ Test complete!');
    console.log('\n💡 Tips:');
    console.log('   - Make sure Arduino is connected via USB');
    console.log('   - Check the port path in talkToArduino.js');
    console.log('   - Open Arduino Serial Monitor (9600 baud) to see received codes');
    console.log('   - Close Arduino IDE Serial Monitor if port is in use');

    process.exit(0);
}, 2000);