const Account = () => {
  const savedUser = localStorage.getItem('user');

  let user = null;

  if (savedUser) {
    user = JSON.parse(savedUser);
  }

  if (!user) {
    return (
      <section className="account-page">
        <div className="account-empty">
          <p className="account-small-title">YOUR ACCOUNT</p>

          <h1>Login required.</h1>

          <p>Please log in to view your account information.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="account-page">
      <div className="account-header">
        <div>
          <p className="account-small-title">YOUR ACCOUNT</p>

          <h1>My Profile</h1>

          <p>View your account information and details.</p>
        </div>
      </div>

      <div className="account-content">
        <div className="account-profile">
          <div className="profile-icon">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="account-profile-text">
            <h2>{user.name}</h2>

            <p className="account-email">{user.email}</p>

            {user.role !== 'customer' && (
              <span className="account-role">{user.role}</span>
            )}
          </div>
        </div>

        <div className="account-information">
          <p className="account-info-title">ACCOUNT INFORMATION</p>

          <div className="account-detail">
            <span>Name</span>

            <strong>{user.name}</strong>
          </div>

          <div className="account-detail">
            <span>Email</span>

            <strong>{user.email}</strong>
          </div>

          {user.role !== 'customer' && (
            <div className="account-detail">
              <span>Account type</span>

              <strong>{user.role}</strong>
            </div>
          )}

          <button className="account-edit-button" type="button">
            Edit Profile
          </button>
        </div>
      </div>
    </section>
  );
};

export default Account;
