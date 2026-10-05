import {Link} from 'react-router';

import Weather from '../components/Weather';

const Home = () => {
  return (
    <div className="home-page">
      <section className="fire-hero">
        <div className="hero-copy">
          <p className="eyebrow">नमस्ते • WELCOME TO THE BHATTI</p>

          <h1>
            NEPALI SOUL.
            <br />
            FULL-ON
            <br />
            <span>FLAVOUR.</span>
          </h1>

          <p className="hero-description">
            Jhol-dripping momo. Smoky sekuwa. A little chilli, a lot of heart.
            Pull up a chair.
          </p>

          <div className="hero-actions">
            <Link to="/menu" className="button-gold">
              Find your flavour ↗
            </Link>

            <Link to="/reservation" className="hero-table">
              Book a table
            </Link>
          </div>

          <div className="hero-foot">
            HAND-FOLDED MOMO
            <span>•</span>
            FIRE-KISSED SEKUWA
          </div>
        </div>

        <div className="hero-photo">
          <img src="/images/bhatti-hero.png" alt="Nepali momo and sekuwa" />

          <div className="photo-caption">
            <span>01 / THE HOUSE FAVOURITE</span>

            <strong>
              Jhol momo.
              <br />
              Big bowl. Bigger flavour.
            </strong>

            <Link to="/menu">Meet your momo ↗</Link>
          </div>

          <div className="round-stamp">
            HOT FOOD.
            <br />
            WARM HEARTS.
          </div>
        </div>
      </section>

      <div className="spice-strip">
        <span>SMOKY.</span>

        <span>SPICY.</span>

        <span>UNMISTAKABLY NEPALI.</span>

        <span>रामेको भट्टी</span>
      </div>

      <section className="specials">
        <article className="home-special-card red-special">
          <span className="special-tag">THE HOUSE FAVOURITE</span>

          <h2>Bhatti's Special</h2>

          <h3>Smoky Chicken Sekuwa</h3>

          <p>
            Flame-grilled chicken with beaten rice, fresh salad and spicy tomato
            achar.
          </p>

          <Link to="/menu">Explore Bhatti favourites ↗</Link>
        </article>

        <article className="home-special-card gold-special">
          <span className="special-tag">TODAY'S PICK</span>

          <h2>Today's Special</h2>

          <h3>Chicken Jhol Momo</h3>

          <p>Juicy chicken dumplings in a warming tomato and sesame broth.</p>

          <Link to="/menu">Explore our momo ↗</Link>
        </article>
      </section>

      <section className="home-section quick-section">
        <div className="quick-heading">
          <p className="eyebrow">WHAT ARE YOU CRAVING?</p>

          <h2>Follow your appetite.</h2>
        </div>

        <div className="quick-categories">
          <Link to="/menu">
            <span>01</span>
            <strong>Momo</strong>
            <b>↗</b>
          </Link>

          <Link to="/menu">
            <span>02</span>
            <strong>Bhatti specials</strong>
            <b>↗</b>
          </Link>

          <Link to="/menu">
            <span>03</span>
            <strong>Main Course</strong>
            <b>↗</b>
          </Link>

          <Link to="/menu">
            <span>04</span>
            <strong>Noodles</strong>
            <b>↗</b>
          </Link>

          <Link to="/menu">
            <span>05</span>
            <strong>Soup</strong>
            <b>↗</b>
          </Link>

          <Link to="/menu">
            <span>06</span>
            <strong>Drinks</strong>
            <b>↗</b>
          </Link>
        </div>
      </section>

      <section className="home-section home-info">
        <div>
          <p className="eyebrow">RAMEY KO BHATTI</p>

          <h2>
            Traditional Nepali food.
            <br />
            Made with heart.
          </h2>

          <p>
            Enjoy momo, dal bhat, chow mein, thukpa and other traditional Nepali
            dishes.
          </p>
        </div>

        <div className="opening-hours">
          <h3>Opening Hours</h3>

          <p>
            Monday - Friday
            <strong>10:30 - 21:00</strong>
          </p>

          <p>
            Saturday
            <strong>12:00 - 22:00</strong>
          </p>

          <p>
            Sunday
            <strong>12:00 - 20:00</strong>
          </p>

          <p className="restaurant-location">Vantaa, Finland</p>
        </div>
      </section>

      <section className="home-weather">
        <Weather />
      </section>

      <section className="table-banner">
        <div>
          <p className="eyebrow">GOOD FOOD DESERVES GOOD COMPANY</p>

          <h2>
            Save a seat.
            <br />
            Bring an appetite.
          </h2>

          <p>
            Family lunch, a catch-up with friends or just because.
            <br />
            There is always a reason to gather.
          </p>
        </div>

        <Link to="/reservation" className="button-gold">
          Book a table ↗
        </Link>
      </section>
    </div>
  );
};

export default Home;
