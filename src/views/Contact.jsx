import {useState} from 'react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleContact = (event) => {
    event.preventDefault();

    setSuccessMessage('Message sent successfully');

    setName('');
    setEmail('');
    setMessage('');

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <section className="contact-page">
      <div className="contact-header">
        <p className="contact-small-title">VISIT US</p>

        <h1>
          Come say
          <br />
          namaste.
        </h1>

        <p>
          Have a question about our menu, reservations or restaurant? Get in
          touch with us.
        </p>
      </div>

      <div className="contact-content">
        <div className="contact-information">
          <div className="contact-info-card">
            <span>01</span>

            <div>
              <h3>Restaurant</h3>

              <p>Ramey Ko Bhatti</p>

              <p>
                Metropolia University of Applied Sciences
                <br />
                Myyrmäki Campus
              </p>

              <p>
                Leiritie 1
                <br />
                01600 Vantaa, Finland
              </p>
            </div>
          </div>

          <div className="contact-info-card">
            <span>02</span>

            <div>
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
            </div>
          </div>

          <div className="contact-info-card">
            <span>03</span>

            <div>
              <h3>Contact</h3>

              <p>Phone: +358 123456789</p>

              <p>Email: rameykobhatti@gmail.com</p>
            </div>
          </div>

          <div className="contact-map">
            <iframe
              title="Ramey Ko Bhatti location"
              src="https://www.google.com/maps?q=Metropolia+University+of+Applied+Sciences+Myyrmaki+Campus+Leiritie+1+Vantaa&output=embed"
              loading="lazy"
            ></iframe>
          </div>
        </div>

        <div className="contact-form-box">
          {successMessage && (
            <p className="contact-success">{successMessage}</p>
          )}
          <p className="contact-form-title">SEND US A MESSAGE</p>

          <h2>Get in touch.</h2>

          <form onSubmit={handleContact}>
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
              <label>Email</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label>Message</label>

              <textarea
                placeholder="Write your message..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
              ></textarea>
            </div>

            <button className="contact-button" type="submit">
              Send Message ↗
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
