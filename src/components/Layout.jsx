import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    // This is the main container that has our background image.
    <div className="page-background">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
