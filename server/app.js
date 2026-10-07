/* global process */

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import connection from './database.js';
import {authenticateToken} from './middleware/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

// HOME

app.get('/', (req, res) => {
  res.send('Rame Ko Bhatti API');
});

// MENU

app.get('/api/menu', async (req, res) => {
  const [rows] = await connection.query('SELECT * FROM rkb_menu');

  res.json(rows);
});

app.put('/api/menu/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required',
    });
  }

  const id = req.params.id;
  const {name, price, diet} = req.body;

  try {
    const sql =
      'UPDATE rkb_menu SET name = ?, price = ?, diet = ? WHERE menu_id = ?';

    await connection.execute(sql, [name, price, diet, id]);

    res.json({
      message: 'Menu item updated',
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Error updating menu item',
    });
  }
});

// LUNCH

app.get('/api/lunch', async (req, res) => {
  const [rows] = await connection.query('SELECT * FROM rkb_lunch');

  res.json(rows);
});

app.put('/api/lunch/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required',
    });
  }

  const id = req.params.id;
  const {day, name, price, diet} = req.body;

  try {
    await connection.execute(
      `UPDATE rkb_lunch
        SET day = ?, name = ?, price = ?, diet = ?
        WHERE lunch_id = ?`,
      [day, name, price, diet, id]
    );

    res.json({
      message: 'Lunch item updated',
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Error updating lunch item',
    });
  }
});

// REGISTER

app.post('/api/register', async (req, res) => {
  const {name, email, password} = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await connection.query(
    'INSERT INTO rkb_users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );

  res.status(201).json({
    message: 'User registered successfully',
  });
});

// LOGIN

app.post('/api/login', async (req, res) => {
  const {email, password} = req.body;

  const [users] = await connection.query(
    'SELECT * FROM rkb_users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    return res.status(401).json({
      message: 'Invalid email or password',
    });
  }

  const user = users[0];

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({
      message: 'Invalid email or password',
    });
  }

  const token = jwt.sign(
    {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '2h',
    }
  );

  res.json({
    message: 'Login successful',

    token: token,

    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// ADMIN CHECK

app.get('/api/admin', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required',
    });
  }

  res.json({
    message: 'Admin access granted',
  });
});

// CREATE ORDER

app.post('/api/orders', authenticateToken, async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({
      message: 'Customer access required',
    });
  }

  const {customerName, phone, pickupTime, items} = req.body;

  try {
    const [result] = await connection.execute(
      `INSERT INTO rkb_orders
          (user_id, customer_name, phone, pickup_time)
          VALUES (?, ?, ?, ?)`,
      [req.user.user_id, customerName, phone, pickupTime]
    );

    const orderId = result.insertId;

    for (const item of items) {
      await connection.execute(
        `INSERT INTO rkb_order_items
          (order_id, menu_id, item_name, price, quantity)
          VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.menu_id, item.name, item.price, item.quantity || 1]
      );
    }

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: orderId,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Error placing order',
    });
  }
});

// GET ALL ORDERS

app.get('/api/orders', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({
      message: 'Staff access required',
    });
  }

  try {
    const [orders] = await connection.execute(
      'SELECT * FROM rkb_orders ORDER BY created_at DESC'
    );

    res.json(orders);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Error getting orders',
    });
  }
});

// GET ORDER ITEMS

app.get('/api/orders/:id/items', authenticateToken, async (req, res) => {
  const id = req.params.id;

  try {
    const [orders] = await connection.execute(
      'SELECT * FROM rkb_orders WHERE order_id = ?',
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    const order = orders[0];

    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'moderator' &&
      order.user_id !== req.user.user_id
    ) {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    const [items] = await connection.execute(
      'SELECT * FROM rkb_order_items WHERE order_id = ?',
      [id]
    );

    res.json(items);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Error getting order items',
    });
  }
});

// UPDATE ORDER STATUS

app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({
      message: 'Staff access required',
    });
  }

  const id = req.params.id;
  const {status} = req.body;

  try {
    await connection.execute(
      'UPDATE rkb_orders SET status = ? WHERE order_id = ?',
      [status, id]
    );

    res.json({
      message: 'Order status updated',
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Error updating order status',
    });
  }
});

// CUSTOMER OWN ORDERS

app.get('/api/my-orders', authenticateToken, async (req, res) => {
  try {
    const [orders] = await connection.execute(
      `SELECT * FROM rkb_orders
          WHERE user_id = ?
          ORDER BY created_at DESC`,
      [req.user.user_id]
    );

    res.json(orders);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Error getting your orders',
    });
  }
});

// CREATE RESERVATION

app.post('/api/reservations', authenticateToken, async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({
      message: 'Customer access required',
    });
  }

  const {customerName, people, reservationDate, reservationTime} = req.body;

  try {
    await connection.execute(
      `INSERT INTO rkb_reservations
        (user_id, customer_name, people, reservation_date, reservation_time)
        VALUES (?, ?, ?, ?, ?)`,
      [req.user.user_id, customerName, people, reservationDate, reservationTime]
    );

    res.status(201).json({
      message: 'Reservation created successfully',
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Error creating reservation',
    });
  }
});

// GET ALL RESERVATIONS

app.get('/api/reservations', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({
      message: 'Staff access required',
    });
  }

  try {
    const [reservations] = await connection.execute(
      `SELECT * FROM rkb_reservations
          ORDER BY reservation_date ASC,
          reservation_time ASC`
    );

    res.json(reservations);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Error getting reservations',
    });
  }
});

// UPDATE RESERVATION STATUS

app.put('/api/reservations/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({
      message: 'Staff access required',
    });
  }

  const id = req.params.id;
  const {status} = req.body;

  try {
    await connection.execute(
      `UPDATE rkb_reservations
        SET status = ?
        WHERE reservation_id = ?`,
      [status, id]
    );

    res.json({
      message: 'Reservation status updated',
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Error updating reservation status',
    });
  }
});

// CUSTOMER OWN RESERVATIONS

app.get('/api/my-reservations', authenticateToken, async (req, res) => {
  try {
    const [reservations] = await connection.execute(
      `SELECT * FROM rkb_reservations
          WHERE user_id = ?
          ORDER BY reservation_date DESC,
          reservation_time DESC`,
      [req.user.user_id]
    );

    res.json(reservations);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Error getting your reservations',
    });
  }
});

// START SERVER

const PORT = process.env.PORT || 3000;

// Tests import the app directly, so only start listening outside of tests.
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
