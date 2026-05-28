const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Get all facilities' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Create facility' });
});

module.exports = router;