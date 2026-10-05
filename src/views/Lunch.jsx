import {useEffect, useState} from 'react';

import {fetchData} from '../utils/fetchData';

const Lunch = () => {
  const [lunchMenu, setLunchMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLunch = async () => {
      const data = await fetchData('http://127.0.0.1:3000/api/lunch');

      setLunchMenu(data);
      setLoading(false);
    };

    getLunch();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
  });

  const todayLunch = lunchMenu.find((item) => {
    return item.day === today;
  });

  return (
    <section className="lunch-page">
      <div className="lunch-top">
        <div>
          <p className="lunch-small-title">WEEKDAY LUNCH</p>

          <h1>
            Bhatti
            <br />
            Special.
          </h1>

          <p className="lunch-intro">
            Fresh Nepali lunch specials served Monday to Friday.
          </p>
        </div>

        <div className="lunch-info-box">
          <p>AVAILABLE</p>

          <strong>MON - FRI</strong>

          <span>Freshly prepared every day</span>
        </div>
      </div>

      {loading && <p className="lunch-loading">Loading lunch...</p>}

      {!loading && todayLunch && (
        <div className="today-lunch-card">
          <div className="today-lunch-left">
            <p className="today-lunch-label">
              TODAY • {todayLunch.day.toUpperCase()}
            </p>

            <h2>{todayLunch.name}</h2>

            <p className="today-lunch-text">
              Today's Bhatti Special, freshly prepared with Nepali flavours.
            </p>

            <span className="lunch-diet">{todayLunch.diet}</span>
          </div>

          <div className="today-lunch-price">
            {Number(todayLunch.price).toFixed(2)}
            <span>€</span>
          </div>
        </div>
      )}

      {!loading && !todayLunch && (
        <div className="weekend-lunch-card">
          <p className="today-lunch-label">WEEKEND</p>

          <h2>Lunch returns on Monday.</h2>

          <p>
            Check this week's menu below and find your next Bhatti favourite.
          </p>
        </div>
      )}

      {!loading && (
        <div className="weekly-lunch">
          <div className="weekly-lunch-title">
            <div>
              <p className="lunch-small-title">THIS WEEK</p>

              <h2>Lunch menu</h2>
            </div>

            <p>Monday - Friday</p>
          </div>

          <div className="weekly-lunch-header">
            <strong>Day</strong>
            <strong>Dish</strong>
            <strong>Diet</strong>
            <strong>Price</strong>
          </div>

          {lunchMenu.map((item) => (
            <div
              className={
                item.day === today
                  ? 'weekly-lunch-row today-row'
                  : 'weekly-lunch-row'
              }
              key={item.lunch_id}
            >
              <div className="lunch-day">
                <strong>{item.day}</strong>

                {item.day === today && (
                  <span className="today-badge">TODAY</span>
                )}
              </div>

              <span className="lunch-name">{item.name}</span>

              <div>
                <span className="lunch-diet">{item.diet}</span>
              </div>

              <strong className="lunch-price">
                {Number(item.price).toFixed(2)} €
              </strong>
            </div>
          ))}

          <p className="lunch-note">Lunch menu available Monday to Friday.</p>
        </div>
      )}
    </section>
  );
};

export default Lunch;
