import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    // This main div now has the background class, so it's behind everything.
    <div className="page-background">
      <Navbar />
      {/* The <main> tag holds the page content. It has a class to push it
          to the right of the navbar so they don't overlap. */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
