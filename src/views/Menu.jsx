import {useEffect, useState} from 'react';
import {fetchData} from '../utils/fetchData';

const Menu = () => {
  const [foodMenu, setFoodMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');

    if (savedCart) {
      return JSON.parse(savedCart);
    }

    return [];
  });

  const [showCart, setShowCart] = useState(false);
  const [showOrder, setShowOrder] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilter, setShowFilter] = useState('Everything');

  const [orderMessage, setOrderMessage] = useState('');

  // Food details popup
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSpice, setSelectedSpice] = useState('Medium');
  const [quantity, setQuantity] = useState(1);

  const savedUser = localStorage.getItem('user');

  let user = null;

  if (savedUser) {
    user = JSON.parse(savedUser);
  }

  useEffect(() => {
    const getMenu = async () => {
      try {
        const data = await fetchData('http://127.0.0.1:3000/api/menu');
        setFoodMenu(data);
      } catch (error) {
        console.log(error);
      }

      setLoading(false);
    };

    const openCart = () => {
      setShowCart(true);
    };

    getMenu();

    window.addEventListener('openCart', openCart);

    if (sessionStorage.getItem('openCart') === 'true') {
      sessionStorage.removeItem('openCart');

      setTimeout(() => {
        setShowCart(true);
      }, 0);
    }

    return () => {
      window.removeEventListener('openCart', openCart);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));

    let cartItems = 0;

    cart.forEach((item) => {
      cartItems += item.quantity || 1;
    });

    window.dispatchEvent(
      new CustomEvent('cartUpdated', {
        detail: cartItems,
      })
    );
  }, [cart]);

  const openDetails = (item) => {
    setSelectedItem(item);
    setSelectedSpice('Medium');
    setQuantity(1);
  };

  const closeDetails = () => {
    setSelectedItem(null);
    setSelectedSpice('Medium');
    setQuantity(1);
  };

  const addToCart = () => {
    if (!selectedItem) {
      return;
    }

    const cartItem = {
      ...selectedItem,
      quantity: quantity,
    };

    if (Number(selectedItem.spice_option) === 1) {
      cartItem.selectedSpice = selectedSpice;
    }

    setCart([...cart, cartItem]);

    closeDetails();
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((item, itemIndex) => {
      return itemIndex !== index;
    });

    setCart(newCart);
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
        setShowOrder(false);
        setShowCart(false);

        setName('');
        setPhone('');
        setPickupTime('');

        setTimeout(() => {
          setOrderMessage('');
        }, 3000);
      }
    } catch (error) {
      console.log(error);

      setOrderMessage('Error placing order');
    }
  };

  const categories = [
    ...new Set(
      foodMenu.map((item) => item.category).filter((category) => category)
    ),
  ];

  let filteredMenu = foodMenu;

  if (search) {
    filteredMenu = filteredMenu.filter((item) => {
      const itemName = item.name || '';
      const itemDescription = item.description || '';
      const itemCategory = item.category || '';

      return (
        itemName.toLowerCase().includes(search.toLowerCase()) ||
        itemDescription.toLowerCase().includes(search.toLowerCase()) ||
        itemCategory.toLowerCase().includes(search.toLowerCase())
      );
    });
  }

  if (selectedCategory !== 'All') {
    filteredMenu = filteredMenu.filter((item) => {
      return item.category === selectedCategory;
    });
  }

  if (showFilter === 'Vegetarian') {
    filteredMenu = filteredMenu.filter((item) => {
      return (
        item.type?.toLowerCase().includes('vegetarian') ||
        item.diet?.toLowerCase().includes('vegetarian') ||
        item.diet?.toLowerCase().includes('vegan')
      );
    });
  }

  if (showFilter === 'Non-Vegetarian') {
    filteredMenu = filteredMenu.filter((item) => {
      return item.type?.toLowerCase().includes('non-vegetarian');
    });
  }

  if (showFilter === 'Drinks') {
    filteredMenu = filteredMenu.filter((item) => {
      return item.category === 'Drinks';
    });
  }

  return (
    <section className="menu-page">
      <div className="menu-header-block">
        <div className="menu-header-left">
          <p className="menu-small-title">FROM OUR KITCHEN</p>

          <h1 className="menu-big-title">
            Find your <span>flavour.</span>
          </h1>

          <p className="menu-subtitle">
            Nepali favourites, street-side classics and a little something for
            every craving.
          </p>
        </div>

        <div className="menu-header-right">
          <h2>{filteredMenu.length}</h2>

          <p>
            FOOD & DRINK
            <br />
            CHOICES
          </p>
        </div>
      </div>

      {!user && (
        <p className="menu-login-message">
          Browse our menu. Login or register to place an order.
        </p>
      )}

      {orderMessage && <p className="menu-order-message">{orderMessage}</p>}

      <div className="menu-controls">
        <div className="menu-search-box">
          <label>Search the menu</label>

          <input
            type="text"
            placeholder="Try jhol momo, sekuwa or mango..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <p className="menu-small-info">{filteredMenu.length} choices</p>
        </div>

        <div className="menu-filter-box">
          <label>Show me</label>

          <select
            value={showFilter}
            onChange={(event) => setShowFilter(event.target.value)}
          >
            <option>Everything</option>

            <option>Vegetarian</option>

            <option>Non-Vegetarian</option>

            <option>Drinks</option>
          </select>

          <button
            type="button"
            className="clear-filter-button"
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setShowFilter('Everything');
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="menu-category-buttons">
        <button
          type="button"
          className={selectedCategory === 'All' ? 'active-menu-category' : ''}
          onClick={() => setSelectedCategory('All')}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={
              selectedCategory === category ? 'active-menu-category' : ''
            }
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && <p className="menu-loading">Loading menu...</p>}

      {!loading && filteredMenu.length > 0 && (
        <div className="menu-section">
          <div className="menu-section-head">
            <div className="menu-section-title-wrap">
              <span className="menu-section-number">01</span>

              <h2>
                {selectedCategory === 'All' ? 'All Menu' : selectedCategory}
              </h2>
            </div>

            <p className="menu-section-count">
              {filteredMenu.length}{' '}
              {filteredMenu.length === 1 ? 'choice' : 'choices'}
            </p>
          </div>

          <div className="menu-items-grid">
            {filteredMenu.map((item) => (
              <div className="menu-item-card" key={item.menu_id}>
                <span className="menu-type-badge">{item.type}</span>

                <h3>{item.name}</h3>

                <p className="menu-item-description">{item.description}</p>

                <div className="menu-item-bottom">
                  <p className="menu-price">
                    {Number(item.price).toFixed(2)} €
                  </p>

                  <button
                    type="button"
                    className="menu-details-button"
                    onClick={() => openDetails(item)}
                  >
                    View details ↗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && filteredMenu.length === 0 && (
        <div className="empty-menu">
          <h3>No dishes found.</h3>

          <p>Try another search or filter.</p>
        </div>
      )}

      {selectedItem && (
        <div className="details-background">
          <div className="details-panel">
            <button
              type="button"
              className="close-details"
              onClick={closeDetails}
            >
              ✕
            </button>

            <div className="details-image-side">
              <img
                className="details-image"
                src={
                  selectedItem.image
                    ? selectedItem.image
                    : '/images/bhatti-hero.png'
                }
                alt={selectedItem.name}
              />
            </div>

            <div className="details-info">
              <span className="details-category">{selectedItem.category}</span>

              <h2>{selectedItem.name}</h2>

              <p className="details-price">
                {Number(selectedItem.price).toFixed(2)} €
              </p>

              <span className="menu-type-badge">{selectedItem.type}</span>

              <div className="details-line"></div>

              <div className="details-section">
                <h3>Description</h3>

                <p>{selectedItem.description}</p>
              </div>

              <div className="details-section">
                <h3>Ingredients</h3>

                <p>{selectedItem.ingredients}</p>
              </div>

              <div className="details-section allergens-section">
                <h3>Allergens</h3>

                <p>{selectedItem.allergens}</p>
              </div>

              {user && user.role === 'customer' && (
                <>
                  <div className="details-line"></div>

                  {Number(selectedItem.spice_option) === 1 && (
                    <div className="details-section">
                      <h3>Spice level</h3>

                      <div className="spice-options">
                        <button
                          type="button"
                          className={
                            selectedSpice === 'Mild' ? 'active-spice' : ''
                          }
                          onClick={() => setSelectedSpice('Mild')}
                        >
                          Mild
                        </button>

                        <button
                          type="button"
                          className={
                            selectedSpice === 'Medium' ? 'active-spice' : ''
                          }
                          onClick={() => setSelectedSpice('Medium')}
                        >
                          Medium
                        </button>

                        <button
                          type="button"
                          className={
                            selectedSpice === 'Hot' ? 'active-spice' : ''
                          }
                          onClick={() => setSelectedSpice('Hot')}
                        >
                          Hot
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="details-section">
                    <h3>Quantity</h3>

                    <div className="quantity-box">
                      <button
                        type="button"
                        onClick={() => {
                          if (quantity > 1) {
                            setQuantity(quantity - 1);
                          }
                        }}
                      >
                        −
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="details-total">
                    <span>Total</span>

                    <strong>
                      {(Number(selectedItem.price) * quantity).toFixed(2)} €
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="details-add-button"
                    onClick={addToCart}
                  >
                    Add to cart
                  </button>
                </>
              )}

              {!user && (
                <p className="details-login-message">
                  Login or register to order this item.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
                }}
              >
                ✕
              </button>
            </div>

            {!showOrder && (
              <div>
                {cart.length === 0 && (
                  <p className="empty-cart">Your cart is empty.</p>
                )}

                {cart.map((item, index) => (
                  <div className="cart-item" key={index}>
                    <div>
                      <h4>{item.name}</h4>

                      <p>Quantity: {item.quantity || 1}</p>

                      <p>Spice: {item.selectedSpice || 'Medium'}</p>

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
                    <p>{totalItems} items in your cart</p>

                    <h3 className="cart-total">
                      Total: {totalPrice.toFixed(2)} €
                    </h3>

                    <button
                      type="button"
                      className="order-button"
                      onClick={() => setShowOrder(true)}
                    >
                      Continue to Order
                    </button>
                  </div>
                )}
              </div>
            )}

            {showOrder && (
              <div>
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

                  <button className="order-button" type="submit">
                    Confirm Order
                  </button>
                </form>

                <button
                  type="button"
                  className="back-cart-button"
                  onClick={() => setShowOrder(false)}
                >
                  Back to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Menu;
