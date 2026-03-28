require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Sprinter Sports API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Sprinter Sports API running on http://localhost:${PORT}`);
    console.log(`📦 Products endpoint: http://localhost:${PORT}/api/products`);
    console.log(`🔐 Admin login: http://localhost:${PORT}/api/auth/login`);
});
