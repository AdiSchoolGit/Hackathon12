import express from 'express';
import { SerialPort } from 'serialport';

const app = express();
app.use(express.json());

// Open serial port (adjust COM3 or /dev/ttyUSB0)
const port = new SerialPort({
    path: '/dev/ttyACM0',
    baudRate: 9600
});

// Receive pickup code from React → send to Arduino
app.post('/verify', (req, res) => {
    const { code } = req.body;

    console.log("Received code:", code);
    port.write(code + "\n");

    res.json({ status: "sent" });
});

// Listen for Arduino response
port.on('data', data => {
    console.log("Arduino:", data.toString());
});

app.listen(3001, () => console.log("Server running on port 3001"));