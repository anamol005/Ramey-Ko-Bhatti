import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router';

import {fetchData} from '../utils/fetchData';

const Menu = () => {
  const [searchParams] = useSearchParams();

  const [foodMenu, setFoodMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'All'
  );

  const [showFilter, setShowFilter] = useState('Everything');

  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const savedUser = localStorage.getItem('user');

  let user = null;

  if (savedUser) {
    user = JSON.parse(savedUser);
  }

  useEffect(() => {
    const getMenu = async () => {
      try {
        const data = await fetchData(
          'https://ramey-ko-bhatti-backend.onrender.com/api/menu'
        );

        setFoodMenu(data);
      } catch (error) {
        console.log(error);
      }

      setLoading(false);
    };

    getMenu();
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    const searchValue = searchParams.get('search');

    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory('All');
    }

    if (searchValue) {
      setSearch(searchValue);
    }
  }, [searchParams]);

  const openDetails = (item) => {
    setSelectedItem(item);
    setQuantity(1);
  };

  const closeDetails = () => {
    setSelectedItem(null);
    setQuantity(1);
  };

  const addToCart = () => {
    if (!selectedItem) {
      return;
    }

    const savedCart = localStorage.getItem('cart');

    let currentCart = [];

    if (savedCart) {
      currentCart = JSON.parse(savedCart);
    }

    const existingItem = currentCart.find((item) => {
      return item.menu_id === selectedItem.menu_id;
    });

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + quantity;
    } else {
      currentCart.push({
        ...selectedItem,
        quantity: quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));

    let cartCount = 0;

    currentCart.forEach((item) => {
      cartCount += item.quantity || 1;
    });

    window.dispatchEvent(
      new CustomEvent('cartUpdated', {
        detail: cartCount,
      })
    );

    closeDetails();
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
      const itemType = (item.type || '').toLowerCase();
      const itemDiet = (item.diet || '').toLowerCase();

      return (
        itemType === 'vegetarian' ||
        itemDiet.includes('vegetarian') ||
        itemDiet.includes('vegan')
      );
    });
  }

  if (showFilter === 'Non-Vegetarian') {
    filteredMenu = filteredMenu.filter((item) => {
      const itemType = (item.type || '').toLowerCase();
      const itemDiet = (item.diet || '').toLowerCase();

      return (
        itemType === 'non-vegetarian' || itemDiet.includes('non-vegetarian')
      );
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
                <img
                  className="menu-card-image"
                  src={item.image || '/images/bhatti-hero.png'}
                  alt={item.name}
                  onError={(event) => {
                    event.currentTarget.src = '/images/bhatti-hero.png';
                  }}
                />

                <div className="menu-card-content">
                  <div className="menu-card-title-row">
                    <h3>{item.name}</h3>

                    <p className="menu-price">
                      {Number(item.price).toFixed(2)} €
                    </p>
                  </div>

                  <p className="menu-item-description">{item.description}</p>

                  <div className="menu-card-badges">
                    {item.type && (
                      <span className="menu-type-badge">{item.type}</span>
                    )}

                    {item.diet && item.diet !== item.type && (
                      <span className="menu-diet-badge">{item.diet}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="menu-details-button"
                    onClick={() => openDetails(item)}
                  >
                    View Details
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
        <div className="details-background" onClick={closeDetails}>
          <div
            className="details-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="close-details"
              onClick={closeDetails}
              aria-label="Close details"
            >
              ✕
            </button>

            <div className="details-image-side">
              <img
                className="details-image"
                src={selectedItem.image || '/images/bhatti-hero.png'}
                alt={selectedItem.name}
                onError={(event) => {
                  event.currentTarget.src = '/images/bhatti-hero.png';
                }}
              />
            </div>

            <div className="details-info">
              <span className="details-category">{selectedItem.category}</span>

              <div className="details-title-row">
                <h2>{selectedItem.name}</h2>

                <p className="details-price">
                  {Number(selectedItem.price).toFixed(2)} €
                </p>
              </div>

              <div className="details-badges">
                {selectedItem.type && (
                  <span className="menu-type-badge">{selectedItem.type}</span>
                )}

                {selectedItem.diet &&
                  selectedItem.diet !== selectedItem.type && (
                    <span className="menu-diet-badge">{selectedItem.diet}</span>
                  )}
              </div>

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

                <p>{selectedItem.allergens || 'No allergens listed'}</p>
              </div>

              {user && user.role === 'customer' && (
                <>
                  <div className="details-line"></div>

                  <div className="details-order-row">
                    <div className="details-quantity-area">
                      <p className="details-order-label">Quantity</p>

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

                    <button
                      type="button"
                      className="details-add-button"
                      onClick={addToCart}
                    >
                      Add to Cart
                    </button>
                  </div>
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
    </section>
  );
};

export default Menu;
