const express = require('express');
const router = express.Router();

// No auth — always return success
router.post('/login', (req, res) => {
    res.json({ success: true, token: 'no-auth', admin: { email: 'admin', role: 'admin' } });
});

router.post('/logout', (req, res) => {
    res.json({ success: true });
});

module.exports = router;
