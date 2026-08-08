const express = require('express');
const cors = require('cors');
const limiter = require('./middleware/rate-limiter');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(limiter);

// Bind base API route
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
