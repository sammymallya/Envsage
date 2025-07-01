const mongoose  = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
        try {
            const dbURI = process.env.DB_URI;     
            // console.log(`DB Uri: ${dbURI}`);
            await mongoose.connect(dbURI);
            console.log('MongoDB connected successfully!');
        } catch (err) {
            console.error('Error connecting to MongoDB:', err.message);
            process.exit(1); // Exit process with failure
        }
    };

    module.exports = connectDB;