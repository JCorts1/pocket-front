import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook
import './App.css';
import logo from '../src/assets/img/logo.jpg';


const LoginForm = ({ email, password, setEmail, setPassword, handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <h2>Login</h2>
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      required
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(event) => setPassword(event.target.value)}
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
      onChange={(event) => setFullName(event.target.value)}
      required
    />
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      required
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(event) => setPassword(event.target.value)}
      required
    />
    <button className="form-btn" type="submit">Sign Up</button>
  </form>
);


const App = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const [isLoginView, setIsLoginView] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const RAILS_API_URL = 'http://localhost:3000';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const endpoint = isLoginView ? '/login' : '/signup';

    // Construct the payload based on whether it's a login or signup action
    let userPayload;
    if (isLoginView) {
      userPayload = { email: email, password: password };
    } else {
      userPayload = { name: fullName, email: email, password: password };
    }

    const payload = {
      user: userPayload
    };

    try {
      const response = await fetch(RAILS_API_URL + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const jwt = response.headers.get('Authorization');
      const result = await response.json();

      if (response.ok) {
        if (jwt) {
          localStorage.setItem('token', jwt);
        }
        // On success, redirect to the dashboard
        navigate('/dashboard');
      } else {
        setMessage(result.status?.message || 'An error occurred.');
      }

    } catch (error) {
      setMessage('Network error. Could not connect to the server.');
    }
  };

  const handleToggleView = () => {
    setIsFading(true);
    setMessage('');
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
