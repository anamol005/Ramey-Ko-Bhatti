import {useEffect, useState} from 'react';

const Admin = () => {
  const savedUser = localStorage.getItem('user');

  let user = null;

  if (savedUser) {
    user = JSON.parse(savedUser);
  }

  const [menu, setMenu] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [editId, setEditId] = useState(null);

  const [lunch, setLunch] = useState([]);
  const [showLunch, setShowLunch] = useState(false);
  const [editLunchId, setEditLunchId] = useState(null);

  const [lunchDay, setLunchDay] = useState('');
  const [lunchName, setLunchName] = useState('');
  const [lunchPrice, setLunchPrice] = useState('');
  const [lunchDiet, setLunchDiet] = useState('');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [diet, setDiet] = useState('');

  const [orders, setOrders] = useState([]);
  const [statusValues, setStatusValues] = useState({});

  const [reservations, setReservations] = useState([]);
  const [showReservations, setShowReservations] = useState(false);

  const [reservationStatusValues, setReservationStatusValues] = useState({});

  useEffect(() => {
    const getMenu = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/menu');

        const data = await response.json();

        if (response.ok) {
          setMenu(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getLunch = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/lunch');

        const data = await response.json();

        if (response.ok) {
          setLunch(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getOrders = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:3000/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }

        const ordersWithItems = [];

        for (const order of data) {
          const itemResponse = await fetch(
            `http://127.0.0.1:3000/api/orders/${order.order_id}/items`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const itemData = await itemResponse.json();

          ordersWithItems.push({
            ...order,
            items: itemResponse.ok ? itemData : [],
          });
        }

        setOrders(ordersWithItems);
      } catch (error) {
        console.log(error);
      }
    };

    getMenu();
    getLunch();
    getOrders();
  }, []);

  const startEdit = (item) => {
    setEditId(item.menu_id);
    setName(item.name);
    setPrice(item.price);
    setDiet(item.diet);
  };

  const saveEdit = async () => {
    const token = localStorage.getItem('token');

    const response = await fetch(`http://127.0.0.1:3000/api/menu/${editId}`, {
      method: 'PUT',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        name: name,
        price: price,
        diet: diet,
      }),
    });

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      const newMenu = menu.map((item) => {
        if (item.menu_id === editId) {
          return {
            ...item,
            name: name,
            price: price,
            diet: diet,
          };
        }

        return item;
      });

      setMenu(newMenu);
      setEditId(null);
    }
  };

  const startLunchEdit = (item) => {
    setEditLunchId(item.lunch_id);
    setLunchDay(item.day);
    setLunchName(item.name);
    setLunchPrice(item.price);
    setLunchDiet(item.diet);
  };

  const saveLunchEdit = async () => {
    const token = localStorage.getItem('token');

    const response = await fetch(
      `http://127.0.0.1:3000/api/lunch/${editLunchId}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          day: lunchDay,
          name: lunchName,
          price: lunchPrice,
          diet: lunchDiet,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      const newLunch = lunch.map((item) => {
        if (item.lunch_id === editLunchId) {
          return {
            ...item,
            day: lunchDay,
            name: lunchName,
            price: lunchPrice,
            diet: lunchDiet,
          };
        }

        return item;
      });

      setLunch(newLunch);
      setEditLunchId(null);
    }
  };

  const updateOrderStatus = async (orderId) => {
    const token = localStorage.getItem('token');

    const status = statusValues[orderId];

    if (!status) {
      return;
    }

    const response = await fetch(
      `http://127.0.0.1:3000/api/orders/${orderId}/status`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          status: status,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      const newOrders = orders.map((order) => {
        if (order.order_id === orderId) {
          return {
            ...order,
            status: status,
          };
        }

        return order;
      });

      setOrders(newOrders);

      setStatusValues({
        ...statusValues,
        [orderId]: status,
      });
    }
  };

  const getReservations = async () => {
    if (showReservations) {
      setShowReservations(false);
      return;
    }

    const token = localStorage.getItem('token');

    const response = await fetch('http://127.0.0.1:3000/api/reservations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      setReservations(data);
      setShowReservations(true);
    } else {
      alert(data.message);
    }
  };

  const updateReservationStatus = async (reservationId) => {
    const token = localStorage.getItem('token');

    const status = reservationStatusValues[reservationId];

    if (!status) {
      return;
    }

    const response = await fetch(
      `http://127.0.0.1:3000/api/reservations/${reservationId}/status`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          status: status,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      const newReservations = reservations.map((reservation) => {
        if (reservation.reservation_id === reservationId) {
          return {
            ...reservation,
            status: status,
          };
        }

        return reservation;
      });

      setReservations(newReservations);

      setReservationStatusValues({
        ...reservationStatusValues,
        [reservationId]: status,
      });
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <section className="admin-page">
        <div className="admin-access-denied">
          <p className="admin-small-title">STAFF AREA</p>

          <h1>Access denied.</h1>

          <p>You do not have permission to view this page.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <p className="admin-small-title">RESTAURANT MANAGEMENT</p>

          <h1>
            {user.role === 'admin' ? 'Admin Dashboard' : 'Moderator Dashboard'}
          </h1>

          <p>
            Manage restaurant orders, reservations
            {user.role === 'admin' ? ', menu and weekday lunch.' : '.'}
          </p>
        </div>

        <div className="admin-role">
          <span>LOGGED IN AS</span>

          <strong>{user.role}</strong>
        </div>
      </div>

      <div className="admin-overview">
        {user.role === 'admin' && (
          <div className="admin-overview-card">
            <span>MENU</span>

            <strong>{menu.length}</strong>

            <p>Menu items</p>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="admin-overview-card">
            <span>LUNCH</span>

            <strong>{lunch.length}</strong>

            <p>Weekday meals</p>
          </div>
        )}

        <div className="admin-overview-card">
          <span>ORDERS</span>

          <strong>{orders.length}</strong>

          <p>Customer orders</p>
        </div>

        <div className="admin-overview-card">
          <span>RESERVATIONS</span>

          <strong>{reservations.length}</strong>

          <p>Loaded bookings</p>
        </div>
      </div>

      {user.role === 'admin' && (
        <>
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <p className="admin-section-number">01</p>

                <h2>Menu Management</h2>

                <p>View and edit restaurant menu items.</p>
              </div>

              <button
                className="admin-main-button"
                onClick={() => setShowMenu(!showMenu)}
              >
                {showMenu ? 'Hide Menu' : 'Edit Menu'}
              </button>
            </div>

            {showMenu && (
              <div className="admin-items-grid">
                {menu.map((item) => (
                  <div className="admin-item-card" key={item.menu_id}>
                    {editId === item.menu_id ? (
                      <div className="admin-edit-form">
                        <h3>Edit Menu Item</h3>

                        <div>
                          <label>Name</label>

                          <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                          />
                        </div>

                        <div>
                          <label>Price</label>

                          <input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                          />
                        </div>

                        <div>
                          <label>Diet</label>

                          <input
                            type="text"
                            value={diet}
                            onChange={(event) => setDiet(event.target.value)}
                          />
                        </div>

                        <div className="admin-edit-buttons">
                          <button
                            className="admin-save-button"
                            onClick={saveEdit}
                          >
                            Save
                          </button>

                          <button
                            className="admin-cancel-button"
                            onClick={() => setEditId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="admin-item-content">
                        <div className="admin-item-top">
                          <span>MENU ITEM</span>

                          <strong>€{Number(item.price).toFixed(2)}</strong>
                        </div>

                        <h3>{item.name}</h3>

                        <p>Diet: {item.diet}</p>

                        <button
                          className="admin-edit-button"
                          onClick={() => startEdit(item)}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <p className="admin-section-number">02</p>

                <h2>Lunch Management</h2>

                <p>Edit the weekday lunch menu.</p>
              </div>

              <button
                className="admin-main-button"
                onClick={() => setShowLunch(!showLunch)}
              >
                {showLunch ? 'Hide Lunch' : 'Edit Lunch'}
              </button>
            </div>

            {showLunch && (
              <div className="admin-items-grid">
                {lunch.map((item) => (
                  <div className="admin-item-card" key={item.lunch_id}>
                    {editLunchId === item.lunch_id ? (
                      <div className="admin-edit-form">
                        <h3>Edit Lunch</h3>

                        <div>
                          <label>Day</label>

                          <input
                            type="text"
                            value={lunchDay}
                            onChange={(event) =>
                              setLunchDay(event.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label>Name</label>

                          <input
                            type="text"
                            value={lunchName}
                            onChange={(event) =>
                              setLunchName(event.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label>Price</label>

                          <input
                            type="number"
                            step="0.01"
                            value={lunchPrice}
                            onChange={(event) =>
                              setLunchPrice(event.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label>Diet</label>

                          <input
                            type="text"
                            value={lunchDiet}
                            onChange={(event) =>
                              setLunchDiet(event.target.value)
                            }
                          />
                        </div>

                        <div className="admin-edit-buttons">
                          <button
                            className="admin-save-button"
                            onClick={saveLunchEdit}
                          >
                            Save
                          </button>

                          <button
                            className="admin-cancel-button"
                            onClick={() => setEditLunchId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="admin-item-content">
                        <div className="admin-item-top">
                          <span>{item.day}</span>

                          <strong>€{Number(item.price).toFixed(2)}</strong>
                        </div>

                        <h3>{item.name}</h3>

                        <p>Diet: {item.diet}</p>

                        <button
                          className="admin-edit-button"
                          onClick={() => startLunchEdit(item)}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <p className="admin-section-number">
              {user.role === 'admin' ? '03' : '01'}
            </p>

            <h2>Order Management</h2>

            <p>View customer orders and update their status.</p>
          </div>
        </div>

        <div className="admin-orders-list">
          {orders.length === 0 && (
            <p className="admin-empty-text">No orders found.</p>
          )}

          {orders.map((order) => {
            const orderTotal = order.items.reduce((total, item) => {
              return total + Number(item.price) * (item.quantity || 1);
            }, 0);

            return (
              <div className="admin-order-card" key={order.order_id}>
                <div className="admin-order-top">
                  <div>
                    <span>ORDER</span>

                    <h3>#{order.order_id}</h3>
                  </div>

                  <span
                    className={`admin-status ${order.status
                      .toLowerCase()
                      .replace(' ', '-')}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="admin-order-info">
                  <div>
                    <span>Customer</span>

                    <strong>{order.customer_name}</strong>
                  </div>

                  <div>
                    <span>Phone</span>

                    <strong>{order.phone}</strong>
                  </div>

                  <div>
                    <span>Pickup</span>

                    <strong>{order.pickup_time}</strong>
                  </div>

                  <div>
                    <span>Status</span>

                    <strong>{order.status}</strong>
                  </div>
                </div>

                <div className="admin-status-control">
                  <select
                    value={statusValues[order.order_id] || order.status}
                    onChange={(event) =>
                      setStatusValues({
                        ...statusValues,

                        [order.order_id]: event.target.value,
                      })
                    }
                  >
                    <option value="Pending">Pending</option>

                    <option value="Preparing">Preparing</option>

                    <option value="Ready">Ready</option>

                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    onClick={() => updateOrderStatus(order.order_id)}
                    disabled={
                      !statusValues[order.order_id] ||
                      statusValues[order.order_id] === order.status
                    }
                  >
                    Update Status
                  </button>
                </div>

                <div className="admin-order-details">
                  <h4>Order Items</h4>

                  {order.items.length === 0 && (
                    <p>No items found for this order.</p>
                  )}

                  {order.items.map((item) => (
                    <div className="admin-order-item" key={item.order_item_id}>
                      <div>
                        <strong>{item.item_name}</strong>

                        <span>Quantity: {item.quantity || 1}</span>
                      </div>

                      <strong>
                        €
                        {(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                      </strong>
                    </div>
                  ))}

                  <div className="admin-order-total">
                    <span>Total</span>

                    <strong>€{orderTotal.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <p className="admin-section-number">
              {user.role === 'admin' ? '04' : '02'}
            </p>

            <h2>Reservation Management</h2>

            <p>View table bookings and update reservation status.</p>
          </div>

          <button className="admin-main-button" onClick={getReservations}>
            {showReservations ? 'Hide Reservations' : 'View Reservations'}
          </button>
        </div>

        {showReservations && (
          <div className="admin-orders-list">
            {reservations.length === 0 && (
              <p className="admin-empty-text">No reservations found.</p>
            )}

            {reservations.map((reservation) => (
              <div
                className="admin-order-card"
                key={reservation.reservation_id}
              >
                <div className="admin-order-top">
                  <div>
                    <span>RESERVATION</span>

                    <h3>#{reservation.reservation_id}</h3>
                  </div>

                  <span
                    className={`admin-status ${reservation.status
                      .toLowerCase()
                      .replace(' ', '-')}`}
                  >
                    {reservation.status}
                  </span>
                </div>

                <div className="admin-reservation-info">
                  <div>
                    <span>Customer</span>

                    <strong>{reservation.customer_name}</strong>
                  </div>

                  <div>
                    <span>People</span>

                    <strong>{reservation.people}</strong>
                  </div>

                  <div>
                    <span>Date</span>

                    <strong>
                      {reservation.reservation_date.split('T')[0]}
                    </strong>
                  </div>

                  <div>
                    <span>Time</span>

                    <strong>{reservation.reservation_time}</strong>
                  </div>
                </div>

                <div className="admin-status-control">
                  <select
                    value={
                      reservationStatusValues[reservation.reservation_id] ||
                      reservation.status
                    }
                    onChange={(event) =>
                      setReservationStatusValues({
                        ...reservationStatusValues,

                        [reservation.reservation_id]: event.target.value,
                      })
                    }
                  >
                    <option value="Pending">Pending</option>

                    <option value="Confirmed">Confirmed</option>

                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() =>
                      updateReservationStatus(reservation.reservation_id)
                    }
                    disabled={
                      !reservationStatusValues[reservation.reservation_id] ||
                      reservationStatusValues[reservation.reservation_id] ===
                        reservation.status
                    }
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Admin;
