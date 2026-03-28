const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
        { email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.json({
        success: true,
        token,
        admin: { email, role: 'admin' }
    });
});

// Admin logout (handled client-side by clearing token)s
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
