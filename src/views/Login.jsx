import {useState} from 'react';

const Login = () => {
  const [showRegister, setShowRegister] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [message, setMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    const user = {
      email: loginEmail,
      password: loginPassword,
    };

    try {
      const response = await fetch(
        'https://ramey-ko-bhatti-backend.onrender.com/api/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(user),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setMessage(data.message);

        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.log(error);
      setMessage('Login failed');
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const user = {
      name: name,
      email: registerEmail,
      password: registerPassword,
    };

    try {
      const response = await fetch(
        'https://ramey-ko-bhatti-backend.onrender.com/api/register',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(user),
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        setName('');
        setRegisterEmail('');
        setRegisterPassword('');

        setShowRegister(false);
      }
    } catch (error) {
      console.log(error);
      setMessage('Registration failed');
    }
  };

  const showLogin = () => {
    setShowRegister(false);
    setMessage('');
  };

  const showRegistration = () => {
    setShowRegister(true);
    setMessage('');
  };

  return (
    <section className="login-page">
      <div className="login-info">
        <p className="login-small-title">WELCOME TO RAMEY KO BHATTI</p>

        <h1>
          Good food.
          <br />
          Your account.
        </h1>

        <p className="login-info-text">
          Login to place food orders, book a table and check your reservations
          and orders.
        </p>

        <div className="login-info-list">
          <div>
            <span>01</span>

            <div>
              <h3>Order food</h3>

              <p>Add your favourite dishes to the cart.</p>
            </div>
          </div>

          <div>
            <span>02</span>

            <div>
              <h3>Book a table</h3>

              <p>Make and manage your reservations.</p>
            </div>
          </div>

          <div>
            <span>03</span>

            <div>
              <h3>Check your orders</h3>

              <p>See the current status of your orders.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="login-box">
        <div className="login-tabs">
          <button
            className={!showRegister ? 'active-login-tab' : ''}
            onClick={showLogin}
          >
            Login
          </button>

          <button
            className={showRegister ? 'active-login-tab' : ''}
            onClick={showRegistration}
          >
            Register
          </button>
        </div>

        {message && <p className="login-message">{message}</p>}

        {!showRegister && (
          <div className="login-form">
            <p className="login-form-title">WELCOME BACK</p>

            <h2>Login</h2>

            <form onSubmit={handleLogin}>
              <div>
                <label>Email</label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                />
              </div>

              <div>
                <label>Password</label>

                <input
                  type="password"
                  placeholder="Your password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  required
                />
              </div>

              <button className="login-submit-button" type="submit">
                Login ↗
              </button>
            </form>

            <p className="login-change-text">
              Don't have an account?
              <button onClick={showRegistration}>Register</button>
            </p>
          </div>
        )}

        {showRegister && (
          <div className="login-form">
            <p className="login-form-title">CREATE AN ACCOUNT</p>

            <h2>Register</h2>

            <form onSubmit={handleRegister}>
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
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  required
                />
              </div>

              <div>
                <label>Password</label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  required
                />
              </div>

              <button className="login-submit-button" type="submit">
                Create Account ↗
              </button>
            </form>

            <p className="login-change-text">
              Already have an account?
              <button onClick={showLogin}>Login</button>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Login;
