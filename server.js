const path = require('path');

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');

const APIError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');

const dbConnection = require('./config/databse');

const mountRoutes = require('./routes');

// Configure .env file
dotenv.config({ path: 'config.env' });

// Connect with database
dbConnection();

// Express app
const app = express();

// Middlewares

// Enable Cross-Origin Resource Sharing
app.use(cors());
app.options('*', cors());

// Compress Response size
app.use(compression());

// Set Request size limit
app.use(express.json({ limit: '20kb' }));

// To apply Data Sanitization
app.use(mongoSanitize());
app.use(xss());

// Static files
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

// Limit each IP to 100 requests per `window` (here, per 15 minutes).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply the Rate Limiting middleware to all requests
app.use('/api', limiter);

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(hpp({ whitelist: ['price', 'sold', 'quantity', 'avgRating'] }));

// Mount Routes
mountRoutes(app);

app.all('*', (req, res, next) => {
  // Create Custom Error and send to error handling middleware
  const error = new APIError(`Can't find this route: ${req.originalUrl}`, 400);
  next(error);
});

// Global error handling middleware for express errors
app.use(globalError);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

// Handle error rejections outside exprees
process.on('unhandledRejection', (error) => {
  console.error(
    `Unhandeled Rejection Errors: ${error.name} | ${error.message}`
  );
  // Finish unhandeled requests first then close server
  server.close(() => {
    console.log(`Shutting down....`);
    process.exit(1);
  });
});
