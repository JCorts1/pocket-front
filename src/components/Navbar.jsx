import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '@/assets/img/logo.jpg';
import '../assets/styles/Navbar.css'; // We will use this CSS file.

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const IncomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const BudgetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8l-6 6"/><path d="M8 8h.01"/><path d="M16 16h.01"/></svg>;

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="vertical-navbar">
      <div className="navbar-header">
        <img src={logo} alt="Pocket Logo" className="navbar-logo" />
        <span className="navbar-brand">POCKET</span>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/dashboard">
            <HomeIcon />
            <span>Add Expense</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/income">
            <IncomeIcon />
            <span>Add Income</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/budget">
            <BudgetIcon />
            <span>Budget Goals</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/expenses">
            <ListIcon />
            <span>My Expenses</span>
          </NavLink>
        </li>
      </ul>
      <div className="navbar-footer">
        <button onClick={handleLogout} className="logout-button">
          <LogoutIcon />
          <span>Log Out</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
