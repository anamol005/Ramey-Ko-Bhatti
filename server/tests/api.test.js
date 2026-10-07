/* global process */

import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

vi.mock('../database.js', () => ({
  default: {
    query: vi.fn(),
    execute: vi.fn(),
  },
}));

const SECRET = 'test-secret';

let app;
let db;

/**
 * Creates a signed JWT like the login route does.
 * @param {string} role - customer, moderator or admin
 * @param {number} userId - id stored in the token
 * @returns {string} Authorization header value
 */
const authHeader = (role, userId = 1) => {
  const token = jwt.sign(
    {user_id: userId, name: 'Test', email: 'test@example.com', role},
    SECRET,
    {expiresIn: '1h'}
  );
  return `Bearer ${token}`;
};

beforeAll(async () => {
  process.env.JWT_SECRET = SECRET;
  db = (await import('../database.js')).default;
  app = (await import('../app.js')).default;
});

beforeEach(() => {
  db.query.mockReset();
  db.execute.mockReset();
});

describe('public routes', () => {
  it('GET / answers with the API name', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('Rame Ko Bhatti API');
  });

  it('GET /api/menu returns the menu rows as JSON', async () => {
    const rows = [{menu_id: 1, name: 'Momo', price: 9.5, diet: 'Vegetarian'}];
    db.query.mockResolvedValueOnce([rows]);

    const res = await request(app).get('/api/menu');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });

  it('GET /api/lunch returns the lunch rows as JSON', async () => {
    const rows = [{lunch_id: 1, day: 'Monday', name: 'Dal Bhat', price: 11}];
    db.query.mockResolvedValueOnce([rows]);

    const res = await request(app).get('/api/lunch');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });
});

describe('login', () => {
  it('rejects an unknown email with 401', async () => {
    db.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .post('/api/login')
      .send({email: 'nobody@example.com', password: 'secret'});

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('rejects a wrong password with 401', async () => {
    const hash = bcrypt.hashSync('correct-password', 4);
    db.query.mockResolvedValueOnce([
      [
        {
          user_id: 1,
          name: 'A',
          email: 'a@b.fi',
          password: hash,
          role: 'customer',
        },
      ],
    ]);

    const res = await request(app)
      .post('/api/login')
      .send({email: 'a@b.fi', password: 'wrong-password'});

    expect(res.status).toBe(401);
  });

  it('returns a valid token and user on correct credentials', async () => {
    const hash = bcrypt.hashSync('correct-password', 4);
    db.query.mockResolvedValueOnce([
      [
        {
          user_id: 7,
          name: 'Anu',
          email: 'a@b.fi',
          password: hash,
          role: 'customer',
        },
      ],
    ]);

    const res = await request(app)
      .post('/api/login')
      .send({email: 'a@b.fi', password: 'correct-password'});

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({
      user_id: 7,
      name: 'Anu',
      email: 'a@b.fi',
      role: 'customer',
    });

    const decoded = jwt.verify(res.body.token, SECRET);
    expect(decoded.role).toBe('customer');
    expect(decoded.user_id).toBe(7);
  });
});

describe('registration', () => {
  it('stores a hashed password, never the plain one', async () => {
    db.query.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .post('/api/register')
      .send({name: 'Anu', email: 'a@b.fi', password: 'plain-password'});

    expect(res.status).toBe(201);

    const params = db.query.mock.calls[0][1];
    expect(params[0]).toBe('Anu');
    expect(params[1]).toBe('a@b.fi');
    expect(params[2]).not.toBe('plain-password');
    expect(bcrypt.compareSync('plain-password', params[2])).toBe(true);
  });
});

describe('authentication and roles', () => {
  it('returns 401 when no token is sent', async () => {
    const res = await request(app).get('/api/admin');

    expect(res.status).toBe(401);
  });

  it('returns 403 for an invalid token', async () => {
    const res = await request(app)
      .get('/api/admin')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(403);
  });

  it('blocks customers from the admin route', async () => {
    const res = await request(app)
      .get('/api/admin')
      .set('Authorization', authHeader('customer'));

    expect(res.status).toBe(403);
  });

  it('lets admins into the admin route', async () => {
    const res = await request(app)
      .get('/api/admin')
      .set('Authorization', authHeader('admin'));

    expect(res.status).toBe(200);
  });
});

describe('menu editing', () => {
  it('blocks customers from editing a menu item', async () => {
    const res = await request(app)
      .put('/api/menu/3')
      .set('Authorization', authHeader('customer'))
      .send({name: 'Hack', price: 0, diet: 'Vegan'});

    expect(res.status).toBe(403);
    expect(db.execute).not.toHaveBeenCalled();
  });

  it('lets an admin update a menu item', async () => {
    db.execute.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .put('/api/menu/3')
      .set('Authorization', authHeader('admin'))
      .send({name: 'Chow Mein', price: 12, diet: 'Vegetarian'});

    expect(res.status).toBe(200);
    expect(db.execute.mock.calls[0][1]).toEqual([
      'Chow Mein',
      12,
      'Vegetarian',
      '3',
    ]);
  });
});

describe('orders', () => {
  it('lets a customer place an order and saves every item', async () => {
    db.execute.mockResolvedValueOnce([{insertId: 42}]).mockResolvedValue([{}]);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', authHeader('customer', 5))
      .send({
        customerName: 'Anu',
        phone: '0401234567',
        pickupTime: '18:30',
        items: [
          {menu_id: 1, name: 'Momo', price: 9.5, quantity: 2},
          {menu_id: 2, name: 'Chow Mein', price: 12},
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.orderId).toBe(42);
    // 1 insert for the order + 2 inserts for the items
    expect(db.execute).toHaveBeenCalledTimes(3);
    // quantity falls back to 1 when it is missing
    expect(db.execute.mock.calls[2][1][4]).toBe(1);
  });

  it('does not let an admin place a customer order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', authHeader('admin'))
      .send({customerName: 'X', phone: '1', pickupTime: '18:00', items: []});

    expect(res.status).toBe(403);
  });

  it('blocks customers from listing all orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', authHeader('customer'));

    expect(res.status).toBe(403);
  });

  it('lets a moderator list all orders', async () => {
    db.execute.mockResolvedValueOnce([[{order_id: 1}, {order_id: 2}]]);

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', authHeader('moderator'));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("hides another customer's order items", async () => {
    db.execute.mockResolvedValueOnce([[{order_id: 9, user_id: 99}]]);

    const res = await request(app)
      .get('/api/orders/9/items')
      .set('Authorization', authHeader('customer', 5));

    expect(res.status).toBe(403);
  });

  it('shows a customer their own order items', async () => {
    db.execute
      .mockResolvedValueOnce([[{order_id: 9, user_id: 5}]])
      .mockResolvedValueOnce([[{item_name: 'Momo', quantity: 2}]]);

    const res = await request(app)
      .get('/api/orders/9/items')
      .set('Authorization', authHeader('customer', 5));

    expect(res.status).toBe(200);
    expect(res.body[0].item_name).toBe('Momo');
  });

  it('returns 404 for an order that does not exist', async () => {
    db.execute.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .get('/api/orders/404/items')
      .set('Authorization', authHeader('admin'));

    expect(res.status).toBe(404);
  });
});

describe('reservations', () => {
  it('blocks customers from the staff reservation list', async () => {
    const res = await request(app)
      .get('/api/reservations')
      .set('Authorization', authHeader('customer'));

    expect(res.status).toBe(403);
  });

  it('lets a customer create a reservation', async () => {
    db.execute.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', authHeader('customer', 5))
      .send({
        customerName: 'Anu',
        people: 4,
        reservationDate: '2026-10-20',
        reservationTime: '19:00',
      });

    expect(res.status).toBe(201);
    expect(db.execute.mock.calls[0][1][0]).toBe(5);
  });
});
