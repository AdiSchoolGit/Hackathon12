/**
 * Test Arduino Serial Communication
 * Run: node test-arduino-communication.js
 * 
 * This tests if the backend can communicate with Arduino via Serial Port
 */

import { 
    initializeArduinoConnection,
    sendPickupCodeToArduino,
    getAllStoredCodes
} from './src/talkToArduino.js';

console.log('🧪 Testing Arduino Communication...\n');

// Test with Arduino 110 port (try common variations)
const ARDUINO_PORTS = [
    '/dev/cu.usbmodem110',
    '/dev/cu.usbserial-110',
    '/dev/cu.usbmodem101',
    null // null = auto-detect
];

console.log(`📡 Attempting to connect to Arduino on port: ${ARDUINO_PORT}\n`);

// Initialize connection
initializeArduinoConnection(ARDUINO_PORT)
    .then(connected => {
        if (connected) {
            console.log('✅ Connection initialized successfully!\n');
        } else {
            console.log('⚠️  Connection not established (may need to wait or check port)\n');
        }
        
        // Wait a moment for connection to establish
        setTimeout(() => {
            console.log('📦 Sending test pickup code: 1234 to BOX_1...\n');
            sendPickupCodeToArduino('1234', 'BOX_1', 'test-card-123');
            
            // Wait and check stored codes
            setTimeout(() => {
                console.log('\n📋 Stored codes:');
                const codes = getAllStoredCodes();
                if (codes.length > 0) {
                    console.log(JSON.stringify(codes, null, 2));
                    console.log('\n✅ Test successful! Code was sent to Arduino.');
                    console.log('\n💡 Next steps:');
                    console.log('   1. Open Arduino Serial Monitor (115200 baud)');
                    console.log('   2. You should see: "✅ Received code from backend: 1234"');
                    console.log('   3. Enter code "1234" on Arduino');
                    console.log('   4. Motor should open!');
                } else {
                    console.log('   No codes stored yet (may still be sending)');
                }
                
                process.exit(0);
            }, 2000);
        }, 3000);
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure Arduino is connected via USB');
        console.log('   2. Close Arduino IDE Serial Monitor');
        console.log('   3. Check port path is correct');
        console.log('   4. Try different port: /dev/cu.usbmodem101 or /dev/cu.usbserial-110');
        process.exit(1);
    });

