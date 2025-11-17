import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';

// Get local IP address for phone access
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const localIP = getLocalIP();
const apiTarget = `http://${localIP}:4000`;

console.log(`\n📱 Frontend running on: http://${localIP}:5173`);
console.log(`🔗 Backend proxy target: ${apiTarget}\n`);

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: '0.0.0.0', // Allow connections from network (for phone access)
        proxy: {
            '/api': {
                target: apiTarget,
                changeOrigin: true
            }
        }
    }
});