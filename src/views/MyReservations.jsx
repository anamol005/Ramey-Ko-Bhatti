import {useEffect, useState} from 'react';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const getMyReservations = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(
          'http://127.0.0.1:3000/api/my-reservations',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setReservations(data);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getMyReservations();
  }, []);

  return (
    <section className="my-reservations-page">
      <div className="my-reservations-header">
        <div>
          <p className="reservations-small-title">YOUR BOOKINGS</p>

          <h1>My Reservations</h1>

          <p>
            Check your upcoming table reservations and their current status.
          </p>
        </div>

        <div className="reservations-count">
          <strong>{reservations.length}</strong>

          <span>
            TOTAL
            <br />
            BOOKINGS
          </span>
        </div>
      </div>

      {reservations.length === 0 && (
        <div className="no-reservations">
          <h2>No reservations yet.</h2>

          <p>
            Your table reservations will appear here after you make your first
            booking.
          </p>
        </div>
      )}

      <div className="reservations-list">
        {reservations.map((reservation) => (
          <div
            className="customer-reservation-card"
            key={reservation.reservation_id}
          >
            <div className="reservation-card-top">
              <div>
                <p className="reservation-number">RESERVATION</p>

                <h2>#{reservation.reservation_id}</h2>
              </div>

              <span
                className={`reservation-status ${reservation.status
                  .toLowerCase()
                  .replace(' ', '-')}`}
              >
                {reservation.status}
              </span>
            </div>

            <div className="reservation-main-info">
              <div>
                <span>Date</span>

                <strong>{reservation.reservation_date.split('T')[0]}</strong>
              </div>

              <div>
                <span>Time</span>

                <strong>{reservation.reservation_time}</strong>
              </div>

              <div>
                <span>People</span>

                <strong>{reservation.people}</strong>
              </div>

              <div>
                <span>Status</span>

                <strong>{reservation.status}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MyReservations;
