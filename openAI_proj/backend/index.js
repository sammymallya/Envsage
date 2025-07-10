const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/route');
const port = 3000;

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://127.0.0.1:5504'
}));

// Connect to DB once at startup
connectDB();

// Mount routes
app.use('/api', userRoutes);



// Start server
app.listen(port, () => console.log('Server running at port 3000'));