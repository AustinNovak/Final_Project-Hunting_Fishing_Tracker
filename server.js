// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { setupDatabase } = require('./database/setup');

const authRoutes = require('./routes/authRoutes');


const userRoutes = require('./routes/userRoutes');
const tripRoutes = require('./routes/tripRoutes');
const speciesRoutes = require('./routes/speciesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/species', speciesRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} is not a valid endpoint`
  });
});

// Start server
async function start() {
  try {
    await setupDatabase({ force: false });

    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

start();

module.exports = app;
