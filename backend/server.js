const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection using environment variables
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/volt-ai';

mongoose
    .connect(mongoURI) // Removed deprecated options
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Routes


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
