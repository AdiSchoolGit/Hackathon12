/**
 * Find Arduino Port
 * Run: node find-arduino-port.js
 *
 * This script lists all available serial ports to help you find your Arduino
 */

import { SerialPort } from 'serialport';

console.log('🔍 Finding Arduino Port...\n');

async function findPorts() {
    try {
        const ports = await SerialPort.list();

        console.log(`Found ${ports.length} serial port(s):\n`);

        if (ports.length === 0) {
            console.log('❌ No serial ports found.');
            console.log('💡 Make sure Arduino is connected via USB.\n');
            return;
        }

        ports.forEach((port, index) => {
            console.log(`${index + 1}. ${port.path}`);
            if (port.manufacturer) {
                console.log(`   Manufacturer: ${port.manufacturer}`);
            }
            if (port.vendorId) {
                console.log(`   Vendor ID: ${port.vendorId}`);
            }
            if (port.productId) {
                console.log(`   Product ID: ${port.productId}`);
            }
            console.log('');
        });

        // Suggest likely Arduino ports
        const likelyArduino = ports.filter(port =>
            port.path.includes('usbmodem') ||
            port.path.includes('usbserial') ||
            port.path.includes('USB') ||
            (port.manufacturer && port.manufacturer.toLowerCase().includes('arduino'))
        );

        if (likelyArduino.length > 0) {
            console.log('✅ Likely Arduino ports:\n');
            likelyArduino.forEach(port => {
                console.log(`   → ${port.path}`);
            });
            console.log('\n💡 Update this port in backend/src/talkToArduino.js\n');
        } else {
            console.log('⚠️  No obvious Arduino ports found.');
            console.log('💡 Try connecting Arduino and running this script again.\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findPorts();