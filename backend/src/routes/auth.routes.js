const express = require('express');
const router = express.Router();

// TEMP demo (later ilisan ug controller + DB)
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'admin') {
        return res.json({
            message: 'Login successful',
            token: 'dummy-token-123'
        });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
});

router.post('/register', (req, res) => {
    res.json({ message: 'User registered (dummy)' });
});

module.exports = router;