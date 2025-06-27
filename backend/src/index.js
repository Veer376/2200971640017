const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const urlRoutes = require('./routes/urlRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const urlController = require('./controllers/urlController');
const Log = require('./utils/logger');

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log middleware for all requests
app.use((req, res, next) => {
  Log('info', 'middleware', `${req.method} ${req.originalUrl}`);
  next();
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'URL Shortener Microservice is running',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'URL Shortener Microservice' });
});

// API routes
app.use('/', urlRoutes);

// Redirection route for shortened URLs
app.get('/:shortcode', urlController.redirectToUrl);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  Log('info', 'service', `URL Shortener server running on port ${PORT}`);
  Log('info', 'service', `Visit: http://localhost:${PORT}`);
});
