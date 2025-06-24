import React, { useState } from 'react';
import './App.css'; // Make sure this CSS file is imported
import logo from '../src/assets/img/logo.jpg'; // Import the logo

// --- Component Definitions Moved Outside ---
// By defining the components outside of App, they aren't re-created on every render,
// which prevents them from losing focus. We now pass all necessary state and functions
// down as props.

const LoginForm = ({ email, password, setEmail, setPassword, handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <h2>Login</h2>
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button className="form-btn" type="submit">Login</button>
  </form>
);

const SignUpForm = ({ fullName, email, password, setFullName, setEmail, setPassword, handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <h2>Create Account</h2>
    <input
      type="text"
      placeholder="Full Name"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      required
    />
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button className="form-btn" type="submit">Sign Up</button>
  </form>
);


const App = () => {
  // State for the view
  const [isLoginView, setIsLoginView] = useState(true);
  const [isFading, setIsFading] = useState(false);

  // State for form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for messages from the API
  const [message, setMessage] = useState('');

  const RAILS_API_URL = 'http://localhost:3000'; // Your Rails server URL

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(''); // Clear previous messages

    const endpoint = isLoginView ? '/login' : '/signup';
    const payload = {
      user: {
        email: email,
        password: password,
        // Only include name for signups
        ...( !isLoginView && { name: fullName } )
      }
    };

    try {
      const response = await fetch(RAILS_API_URL + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Get the JWT from the authorization header
      const jwt = response.headers.get('Authorization');

      const result = await response.json();

      if (response.ok) {
        // Store the JWT for future requests
        if(jwt) {
          localStorage.setItem('token', jwt);
        }
        setMessage(result.status.message);
        // Here you would typically redirect the user or update the UI
        // For example: window.location.href = '/dashboard';
        console.log('Success:', result);
      } else {
        // Handle errors from the server
        setMessage(result.status.message || 'An error occurred.');
        console.error('Error:', result);
      }

    } catch (error) {
      setMessage('Network error. Could not connect to the server.');
      console.error('Network Error:', error);
    }
  };

  const handleToggleView = () => {
    setIsFading(true);
    setMessage(''); // Clear messages on view toggle
    // Clear input fields when toggling views
    setFullName('');
    setEmail('');
    setPassword('');
    setTimeout(() => {
      setIsLoginView(currentView => !currentView);
      setIsFading(false);
    }, 400);
  };

  return (
    <div className='login-background'>
      <div className="form-container">
        <div className="welcome-header">
          <img src={logo} alt="Pocket App Logo" className="logo-img" />
          <h2 className="welcome-message">Welcome to POCKET</h2>
        </div>

        {/* Display API messages here */}
        {message && <p className="api-message">{message}</p>}

        <div className={`form-content ${isFading ? 'fading' : ''}`}>
          {isLoginView ? (
            <LoginForm
              email={email}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
              handleSubmit={handleSubmit}
            />
          ) : (
            <SignUpForm
              fullName={fullName}
              email={email}
              password={password}
              setFullName={setFullName}
              setEmail={setEmail}
              setPassword={setPassword}
              handleSubmit={handleSubmit}
            />
          )}
        </div>

        <p className="toggle-text">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <button onClick={handleToggleView} className="toggle-btn">
            {isLoginView ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default App;
