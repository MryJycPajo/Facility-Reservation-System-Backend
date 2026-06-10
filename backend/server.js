const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// ROUTES
// ===============================
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const facilityRoutes = require('./src/routes/facility.routes');
const reservationRoutes = require('./src/routes/reservation.routes');
const addonRoutes = require('./src/routes/addon.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const historyRoutes = require('./src/routes/history.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/addons', addonRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/history', historyRoutes);

// ===============================
// TEST ROUTE
// ===============================
app.get('/', (req, res) => {
  res.send('Facility Reservation API is running 🚀');
});

// ===============================
// AUTO EXPIRE
// ===============================
const db = require('./src/config/db');

// AUTO EXPIRE
setInterval(async () => {
  try {
    const [result] = await db.query(`
      UPDATE reservations
      SET status = 'expired'
      WHERE TIMESTAMP(date_of_use, end_time) <= NOW()
      AND LOWER(status) NOT IN ('cancelled', 'expired')
    `);

    console.log(
      `Auto-expire executed. ${result.affectedRows} reservation(s) expired.`
    );

  } catch (err) {
    console.error('Auto-expire error:', err.message);
  }
}, 60000);

// SERVER START
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
