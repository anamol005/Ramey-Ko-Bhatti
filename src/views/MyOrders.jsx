import {useEffect, useState} from 'react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    const getMyOrders = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(
          'https://ramey-ko-bhatti-backend.onrender.com/api/my-orders',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setOrders(data);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getMyOrders();
  }, []);

  const getOrderItems = async (orderId) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `https://ramey-ko-bhatti-backend.onrender.com/api/orders/${orderId}/items`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setOrderItems(data);
        setSelectedOrder(orderId);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const hideOrderDetails = () => {
    setSelectedOrder(null);
    setOrderItems([]);
  };

  return (
    <section className="my-orders-page">
      <div className="my-orders-header">
        <div>
          <p className="orders-small-title">YOUR ORDERS</p>

          <h1>My Orders</h1>

          <p>Check your previous orders and see the current order status.</p>
        </div>

        <div className="orders-count">
          <strong>{orders.length}</strong>

          <span>
            TOTAL
            <br />
            ORDERS
          </span>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="no-orders">
          <h2>No orders yet.</h2>

          <p>Your orders will appear here after you place your first order.</p>
        </div>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <div className="customer-order-card" key={order.order_id}>
            <div className="order-card-top">
              <div>
                <p className="order-number">ORDER</p>

                <h2>#{order.order_id}</h2>
              </div>

              <span
                className={`order-status ${order.status
                  .toLowerCase()
                  .replace(' ', '-')}`}
              >
                {order.status}
              </span>
            </div>

            <div className="order-main-info">
              <div>
                <span>Pickup time</span>

                <strong>{order.pickup_time}</strong>
              </div>

              <div>
                <span>Status</span>

                <strong>{order.status}</strong>
              </div>
            </div>

            {selectedOrder !== order.order_id && (
              <button
                className="order-details-button"
                onClick={() => getOrderItems(order.order_id)}
              >
                View Details
              </button>
            )}

            {selectedOrder === order.order_id && (
              <div className="customer-order-details">
                <h3>Order Items</h3>

                <div className="order-items-list">
                  {orderItems.map((item) => (
                    <div className="order-item-row" key={item.order_item_id}>
                      <div>
                        <strong>{item.item_name}</strong>

                        <span>Quantity: {item.quantity}</span>
                      </div>

                      <strong>
                        €{(Number(item.price) * item.quantity).toFixed(2)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="customer-order-total">
                  <span>Total</span>

                  <strong>
                    €
                    {orderItems
                      .reduce((total, item) => {
                        return total + Number(item.price) * item.quantity;
                      }, 0)
                      .toFixed(2)}
                  </strong>
                </div>

                <button
                  className="hide-order-button"
                  onClick={hideOrderDetails}
                >
                  Hide Details
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default MyOrders;
