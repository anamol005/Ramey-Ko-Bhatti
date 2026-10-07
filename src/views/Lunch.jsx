import {useEffect, useState} from 'react';

import {fetchData} from '../utils/fetchData';

const Lunch = () => {
  const [lunchMenu, setLunchMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLunch = async () => {
      try {
        const data = await fetchData(
          'https://ramey-ko-bhatti-backend.onrender.com/api/lunch'
        );

        setLunchMenu(data);
      } catch (error) {
        console.log(error);
      }

      setLoading(false);
    };

    getLunch();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
  });

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const sortedLunch = [...lunchMenu].sort((a, b) => {
    return weekdays.indexOf(a.day) - weekdays.indexOf(b.day);
  });

  const todayLunch = sortedLunch.filter((item) => {
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

      {!loading && todayLunch.length > 0 && (
        <div className="today-lunch-card">
          <div className="today-lunch-left">
            <p className="today-lunch-label">TODAY • {today.toUpperCase()}</p>

            <h2>Today's Lunch</h2>

            <p className="today-lunch-text">
              Choose from today's freshly prepared lunch specials.
            </p>

            <div className="today-lunch-choices">
              {todayLunch.map((item) => (
                <div className="today-lunch-choice" key={item.lunch_id}>
                  <div>
                    <h3>{item.name}</h3>

                    <span className="lunch-diet">{item.diet}</span>
                  </div>

                  <strong>{Number(item.price).toFixed(2)} €</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && todayLunch.length === 0 && (
        <div className="weekend-lunch-card">
          <p className="today-lunch-label">WEEKEND</p>

          <h2>Lunch returns on Monday.</h2>

          <p>
            Lunch is available Monday to Friday. Check this week's menu below
            and find your next Bhatti favourite.
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

          {sortedLunch.map((item, index) => {
            const previousItem = sortedLunch[index - 1];

            const firstItemOfDay = index === 0 || previousItem.day !== item.day;

            const isToday = item.day === today;

            return (
              <div
                className={
                  isToday ? 'weekly-lunch-row today-row' : 'weekly-lunch-row'
                }
                key={item.lunch_id}
              >
                <div className="lunch-day">
                  {firstItemOfDay && (
                    <>
                      <strong>{item.day}</strong>

                      {isToday && <span className="today-badge">TODAY</span>}
                    </>
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
            );
          })}

          <p className="lunch-note">Lunch menu available Monday to Friday.</p>
        </div>
      )}
    </section>
  );
};

export default Lunch;
