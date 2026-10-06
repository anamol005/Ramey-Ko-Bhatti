import {useEffect, useState} from 'react';
import {Link, Outlet, useLocation} from 'react-router';

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  }, [location.pathname]);

  const [showSideMenu, setShowSideMenu] = useState(false);

  const [showCart, setShowCart] = useState(false);
  const [showOrder, setShowOrder] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [orderMessage, setOrderMessage] = useState('');

  const [cartCount, setCartCount] = useState(() => {
    const savedCart = localStorage.getItem('cart');

    if (savedCart) {
      const cart = JSON.parse(savedCart);

      let items = 0;

      cart.forEach((item) => {
        items += item.quantity || 1;
      });

      return items;
    }

    return 0;
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');

    if (savedCart) {
      return JSON.parse(savedCart);
    }

    return [];
  });

  const savedUser = localStorage.getItem('user');

  let user = null;

  if (savedUser) {
    user = JSON.parse(savedUser);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    window.location.href = '/';
  };

  const closeMenu = () => {
    setShowSideMenu(false);
  };

  const openCart = () => {
    const savedCart = localStorage.getItem('cart');

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      setCart([]);
    }

    setShowOrder(false);
    setOrderMessage('');
    setShowCart(true);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((item, itemIndex) => {
      return itemIndex !== index;
    });

    setCart(newCart);

    localStorage.setItem('cart', JSON.stringify(newCart));

    let items = 0;

    newCart.forEach((item) => {
      items += item.quantity || 1;
    });

    setCartCount(items);

    window.dispatchEvent(
      new CustomEvent('cartUpdated', {
        detail: items,
      })
    );
  };

  const totalPrice = cart.reduce((total, item) => {
    return total + Number(item.price) * (item.quantity || 1);
  }, 0);

  const totalItems = cart.reduce((total, item) => {
    return total + (item.quantity || 1);
  }, 0);

  const handleOrder = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      setOrderMessage('Please login before placing an order');

      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:3000/api/orders', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          customerName: name,
          phone: phone,
          pickupTime: pickupTime,
          items: cart,
        }),
      });

      const data = await response.json();

      setOrderMessage(data.message);

      if (response.ok) {
        setCart([]);
        setCartCount(0);

        localStorage.setItem('cart', JSON.stringify([]));

        window.dispatchEvent(
          new CustomEvent('cartUpdated', {
            detail: 0,
          })
        );

        setName('');
        setPhone('');
        setPickupTime('');

        setShowOrder(false);
        setShowCart(false);
      }
    } catch (error) {
      console.log(error);

      setOrderMessage('Error placing order');
    }
  };

  useEffect(() => {
    const updateCartCount = (event) => {
      setCartCount(event.detail);

      const savedCart = localStorage.getItem('cart');

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    };

    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  return (
    <div>
      <header className="site-header">
        <Link to="/" className="brand">
          <img src="/images/logo.jpeg" alt="Ramey Ko Bhatti" />
        </Link>

        <nav className="desktop-nav">
          <Link to="/">HOME</Link>

          <Link to="/menu">OUR MENU</Link>

          <Link to="/lunch">LUNCH</Link>

          <Link to="/contact">CONTACT</Link>

          <Link to="/reservation" className="nav-book">
            BOOK A TABLE ↗
          </Link>
        </nav>

        <div className="header-tools">
          {!user && (
            <Link to="/login" className="header-icon-button" aria-label="Login">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />

                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            </Link>
          )}

          {user && (
            <Link
              to="/account"
              className="header-icon-button"
              aria-label="Account"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />

                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            </Link>
          )}

          {user && user.role === 'customer' && (
            <button
              type="button"
              className="header-icon-button cart-header-button"
              onClick={openCart}
              aria-label="Cart"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 8h14l-1 12H6L5 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>

              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          )}

          <button
            type="button"
            className="header-icon-button menu-toggle"
            onClick={() => setShowSideMenu(true)}
            aria-label="Menu"
          >
            <span className="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </header>

      {showSideMenu && <div className="menu-overlay" onClick={closeMenu}></div>}

      <div className={showSideMenu ? 'side-menu open' : 'side-menu'}>
        <div className="side-menu-top">
          <Link to="/" className="side-menu-logo" onClick={closeMenu}>
            <img src="/images/logo.jpeg" alt="Ramey Ko Bhatti" />
          </Link>

          <button
            type="button"
            className="close-menu"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="side-menu-links">
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/menu" onClick={closeMenu}>
            Our Menu
          </Link>

          <Link to="/lunch" onClick={closeMenu}>
            Lunch
          </Link>

          <Link to="/contact" onClick={closeMenu}>
            Contact
          </Link>

          <Link to="/reservation" onClick={closeMenu}>
            Book a Table
          </Link>

          {!user && (
            <Link to="/login" onClick={closeMenu}>
              Login / Register
            </Link>
          )}

          {user && user.role === 'customer' && (
            <>
              <Link to="/my-orders" onClick={closeMenu}>
                My Orders
              </Link>

              <Link to="/my-reservations" onClick={closeMenu}>
                My Reservations
              </Link>

              <Link to="/account" onClick={closeMenu}>
                Account
              </Link>
            </>
          )}

          {user && user.role === 'moderator' && (
            <Link to="/admin" onClick={closeMenu}>
              Management
            </Link>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" onClick={closeMenu}>
              Admin Dashboard
            </Link>
          )}
        </nav>

        {user && (
          <div className="side-menu-account">
            <p>Signed in as</p>

            <strong>{user.name}</strong>

            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {showCart && (
        <div className="cart-background">
          <div className="cart-panel">
            <div className="cart-header">
              <h2>{showOrder ? 'Complete Your Order' : 'Your Cart'}</h2>

              <button
                type="button"
                className="close-cart"
                onClick={() => {
                  setShowCart(false);
                  setShowOrder(false);
                  setOrderMessage('');
                }}
              >
                ✕
              </button>
            </div>

            {!showOrder && (
              <>
                {cart.length === 0 && (
                  <p className="empty-cart">Your cart is empty.</p>
                )}

                {cart.map((item, index) => (
                  <div className="cart-item" key={item.menu_id || index}>
                    <div>
                      <h4>{item.name}</h4>

                      <p>Quantity: {item.quantity || 1}</p>

                      <p>
                        {(Number(item.price) * (item.quantity || 1)).toFixed(2)}{' '}
                        €
                      </p>
                    </div>

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeFromCart(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {cart.length > 0 && (
                  <div className="cart-bottom">
                    <p>
                      {totalItems} {totalItems === 1 ? 'item' : 'items'} in your
                      cart
                    </p>

                    <h3 className="cart-total">
                      Total: {totalPrice.toFixed(2)} €
                    </h3>

                    <button
                      type="button"
                      className="order-button"
                      onClick={() => {
                        setShowOrder(true);
                        setOrderMessage('');
                      }}
                    >
                      Continue to Order
                    </button>
                  </div>
                )}
              </>
            )}

            {showOrder && (
              <div className="order-form-area">
                {orderMessage && (
                  <p className="menu-order-message">{orderMessage}</p>
                )}

                <div className="order-summary">
                  <p>
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </p>

                  <strong>Total: {totalPrice.toFixed(2)} €</strong>
                </div>

                <form onSubmit={handleOrder}>
                  <div>
                    <label>Name:</label>

                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label>Phone:</label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label>Pickup time:</label>

                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(event) => setPickupTime(event.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="order-button">
                    Confirm Order
                  </button>
                </form>

                <button
                  type="button"
                  className="back-cart-button"
                  onClick={() => {
                    setShowOrder(false);
                    setOrderMessage('');
                  }}
                >
                  Back to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <strong>Ramey Ko Bhatti</strong>

            <p>Nepali food made with heart.</p>
          </div>

          <div className="footer-links">
            <Link to="/menu">Our Menu</Link>

            <Link to="/lunch">Lunch</Link>

            <Link to="/contact">Contact</Link>

            <Link to="/reservation">Book a Table</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Ramey Ko Bhatti</p>

          <p> Vantaa, Finland</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
