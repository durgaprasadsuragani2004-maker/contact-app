const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config(); // Fallback to current working directory if present

const express = require('express');
const cors = require('cors');
const mongo = require('./database/mongo');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const publicRoutes = require('./routes/publicRoutes');
const { downloadVCard, downloadPersonVCard } = require('./controllers/publicController');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*', // Allow frontend dev server and mobile clients
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads folder exists and serve static uploads with cache headers
const uploadsPath = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/public', publicRoutes);

// Direct top-level vCard download shortcuts
app.get('/api/contact/:token', downloadVCard);
app.get('/api/contact/:token/person/:contactId', downloadPersonVCard);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'QRLync Backend API',
    time: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof require('multer').MulterError) {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

// Initialize database and start Server
async function start() {
  try {
    await mongo.init();
    
    // Auto-seed demo accounts if database is fresh
    const seed = require('./database/seed');
    await seed();

    return new Promise((resolve) => {
      const server = app.listen(PORT, () => {
        console.log(`🚀 QRLync Server running on http://localhost:${PORT}`);
        console.log(`📁 Static uploads served from ${uploadsPath}`);
        resolve(server);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { app, start };
