import React, { useState } from 'react';
import './App.css'; // Make sure this CSS file is imported
import logo from '../src/assets/img/logo.jpg'; // Import the logo

const App = () => {
  // State to track if we are on the login or signup view
  const [isLoginView, setIsLoginView] = useState(true);
  // State to manage the fade animation
  const [isFading, setIsFading] = useState(false);

  // Function to handle toggling between Login and Sign Up
  const handleToggleView = () => {
    setIsFading(true); // Start the fade-out

    // Wait for the fade-out animation to complete
    setTimeout(() => {
      setIsLoginView(currentView => !currentView); // Switch the view
      setIsFading(false); // Start the fade-in
    }, 400); // This duration must match the CSS transition duration
  };

  // The content for the Login form - Updated H2
  const LoginForm = () => (
    <>
      <h2>Login</h2>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button className="form-btn" type="submit">Login</button>
    </>
  );

  // The content for the Sign Up form
  const SignUpForm = () => (
    <>
      <h2>Create Account</h2>
      <input type="text" placeholder="Full Name" />
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button className="form-btn" type="submit">Sign Up</button>
    </>
  );

  return (
    // This is the main container with your background image
    <div className='login-background'>
      {/* This is the glassy, semi-transparent form container */}
      <div className="form-container">

        {/* Logo and Welcome Message Container */}
        <div className="welcome-header">
          <img src={logo} alt="Pocket App Logo" className="logo-img" />
          {/* Using an h2 for consistency */}
          <h2 className="welcome-message">Welcome to POCKET</h2>
        </div>

        {/* This div handles the fading animation */}
        <div className={`form-content ${isFading ? 'fading' : ''}`}>
          {isLoginView ? <LoginForm /> : <SignUpForm />}
        </div>

        {/* This is the text and button to switch between forms */}
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
