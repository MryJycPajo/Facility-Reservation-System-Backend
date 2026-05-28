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
    const sql = "SELECT * FROM facilities";

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        res.json(results);
    });
});

router.post('/', (req, res) => {
    const { fac_name, fac_cost, fac_status } = req.body;

    const sql = `
        INSERT INTO facilities (fac_name, fac_cost, fac_status)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [fac_name, fac_cost, fac_status], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Insert failed"
            });
        }

        res.json({ success: true, message: "Facility added" });
    });
});

router.get('/:id', (req, res) => {
    const sql = "SELECT * FROM facilities WHERE fac_id = ?";

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false });
        }

        res.json(result[0]);
    });
});

router.put('/:id', (req, res) => {
    const { fac_name, fac_cost, fac_status } = req.body;

    const sql = `
        UPDATE facilities
        SET fac_name=?, fac_cost=?, fac_status=?
        WHERE fac_id=?
    `;

    db.query(sql, [fac_name, fac_cost, fac_status, req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ success: false });
        }

        res.json({ success: true, message: "Updated" });
    });
});

router.delete('/:id', (req, res) => {
    const sql = "DELETE FROM facilities WHERE fac_id = ?";

    db.query(sql, [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ success: false });
        }

        res.json({ success: true, message: "Deleted" });
    });
});

module.exports = router;