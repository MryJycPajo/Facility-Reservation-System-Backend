const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Get all reservations' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Create reservation' });
});

module.exports = router;