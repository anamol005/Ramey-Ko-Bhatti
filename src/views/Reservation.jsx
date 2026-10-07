import {useState} from 'react';

const Reservation = () => {
  const [name, setName] = useState('');
  const [people, setPeople] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const [message, setMessage] = useState('');

  const handleReservation = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('Please login before making a reservation');

      return;
    }

    try {
      const response = await fetch(
        'https://ramey-ko-bhatti.onrender.com/api/reservations',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            customerName: name,
            people: people,
            reservationDate: date,
            reservationTime: time,
          }),
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        setName('');
        setPeople('');
        setDate('');
        setTime('');

        setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    } catch (error) {
      console.log(error);

      setMessage('Error making reservation');
    }
  };

  return (
    <section className="reservation-page">
      <div className="reservation-info">
        <p className="reservation-small-title">BOOK A TABLE</p>

        <h1>
          Come hungry.
          <br />
          Leave happy.
        </h1>

        <p className="reservation-text">
          Planning lunch, dinner or a meal with friends? Reserve your table and
          we will have a seat ready for you.
        </p>

        <div className="reservation-details">
          <div>
            <span>01</span>

            <div>
              <h3>Choose your day</h3>

              <p>Select the date that works best for you.</p>
            </div>
          </div>

          <div>
            <span>02</span>

            <div>
              <h3>Choose your time</h3>

              <p>Pick the time you would like to arrive.</p>
            </div>
          </div>

          <div>
            <span>03</span>

            <div>
              <h3>Tell us your group size</h3>

              <p>Let us know how many people are coming.</p>
            </div>
          </div>
        </div>

        <div className="reservation-hours">
          <p className="reservation-hours-title">OPENING HOURS</p>

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
        </div>
      </div>

      <div className="reservation-form-box">
        <p className="reservation-form-title">YOUR RESERVATION</p>

        <h2>Save your seat.</h2>

        {message && <p className="reservation-message">{message}</p>}

        <form onSubmit={handleReservation}>
          <div>
            <label>Name</label>

            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div>
            <label>Number of people</label>

            <input
              type="number"
              min="1"
              placeholder="1"
              value={people}
              onChange={(event) => setPeople(event.target.value)}
              required
            />
          </div>

          <div className="reservation-form-row">
            <div>
              <label>Date</label>

              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>

            <div>
              <label>Time</label>

              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
              />
            </div>
          </div>

          <button className="reservation-button" type="submit">
            Make Reservation ↗
          </button>
        </form>

        <p className="reservation-note">
          You need to be logged in before making a reservation.
        </p>
      </div>
    </section>
  );
};

export default Reservation;
