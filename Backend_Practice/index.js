const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/route');

const app = express();
app.use(express.json());

// Connect to DB once at startup
connectDB();

// Mount routes
app.use('/api', userRoutes);

// Start server
app.listen(3000, () => console.log('Server running'));