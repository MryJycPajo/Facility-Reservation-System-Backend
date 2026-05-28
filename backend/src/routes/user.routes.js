const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'LGUbatuan1990',
    database: 'facility_reservation_db'
});

router.get('/', (req, res) => {
    const sql = "SELECT * FROM users";

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }

        res.json(results);
    });
});

// ADD NEW USER
router.post('/', (req, res) => {

    const {
        user_fullname,
        user_name,
        password,
        user_type
    } = req.body;

    if (!user_fullname || !user_name || !password || !user_type) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    const sql = `
        INSERT INTO users
        (user_fullname, user_name, password, user_type)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [user_fullname, user_name, password, user_type],
        (err, result) => {

            if (err) {
                console.error('Add user error:', err);

                return res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
            }

            res.json({
                success: true,
                message: 'User added successfully'
            });
        }
    );
});

router.put('/:id', (req, res) => {
    const { user_fullname, user_name, user_type } = req.body;

    const sql = `
        UPDATE users
        SET user_fullname=?, user_name=?, user_type=?
        WHERE user_id=?
    `;

    db.query(sql,
        [user_fullname, user_name, user_type, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ success: false });

            res.json({ success: true, message: 'Updated' });
        }
    );
});
router.delete('/:id', (req, res) => {
    const sql = "DELETE FROM users WHERE user_id = ?";

    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false });

        res.json({ success: true, message: 'Deleted' });
    });
});

module.exports = router;