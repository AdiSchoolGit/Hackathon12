import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cardsRouter from './routes/cards.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
// Initialize Arduino communication (will attempt to connect on module load)
import './talkToArduino.js';

// Load environment variables (optional - will use defaults if .env doesn't exist)
try {
    dotenv.config();
} catch (error) {
    console.log('[Server] No .env file found, using defaults');
}

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for Arduino WiFi connections
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', cardsRouter);

// Root route - API information
app.get('/', (req, res) => {
    res.json({
        message: 'Clumsy Aztecs API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            api: {
                'POST /api/found-card-photo': 'Upload a photo of a found card',
                'POST /api/found-card-redid': 'Report a found card by RedID (for Arduino box)',
                'POST /api/pickup-request': 'Validate pickup code',
                'GET /api/cards/:id': 'Get card details by ID',
                'GET /api/cards': 'Get all cards (debug)'
            }
        },
        frontend: 'http://localhost:5173'
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server - listen on all interfaces (0.0.0.0) to allow Arduino WiFi connections
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    console.log(`🌐 Accessible from network at: http://<your-ip>:${PORT}`);
    console.log(`📡 Arduino can connect to: http://<your-ip>:${PORT}/api/pickup-request`);
});

export default app;