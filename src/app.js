const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const limiter = require('./middleware/rate-limiter');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Serve Swagger UI API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Redirect root path to API docs
app.get('/', (req, res) => res.redirect('/api-docs'));

// Apply rate limiter to downstream endpoints
app.use(limiter);

// Bind base API route
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
