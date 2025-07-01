import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '@/assets/img/logo.jpg'; // Using alias for a robust path

// Inline SVG for icons to keep it self-contained
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
// --- NEW ICON for Add Income ---
const IncomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;


// Style objects for NavLink
const navLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '1rem',
  marginBottom: '0.5rem',
  textDecoration: 'none',
  color: '#374151',
  fontWeight: '500',
  borderRadius: '0.5rem',
  transition: 'background-color 0.2s ease-in-out',
};

const activeNavLinkStyle = {
  backgroundColor: 'rgba(236, 72, 153, 0.3)',
  color: '#1f2937',
};

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="fixed left-0 top-0 flex h-screen w-[250px] flex-col p-6 backdrop-blur-lg bg-white/10 border-r border-white/20">
      <div className="flex items-center pb-6 mb-12 border-b border-white/20">
        <img src={logo} alt="Pocket Logo" className="w-[50px] h-[50px] rounded-full mr-4" />
        <span className="text-2xl font-bold text-slate-800 text-shadow">POCKET</span>
      </div>
      <ul className="flex-grow p-0 m-0 list-none">
        <li>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => isActive ? {...navLinkStyle, ...activeNavLinkStyle} : navLinkStyle}
          >
            <HomeIcon />
            <span className="ml-4">Add Expense</span>
          </NavLink>
        </li>
        {/* --- NEW LINK FOR ADD INCOME --- */}
        <li>
          <NavLink
            to="/income"
            style={({ isActive }) => isActive ? {...navLinkStyle, ...activeNavLinkStyle} : navLinkStyle}
          >
            <IncomeIcon />
            <span className="ml-4">Add Income</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/expenses"
            style={({ isActive }) => isActive ? {...navLinkStyle, ...activeNavLinkStyle} : navLinkStyle}
          >
            <ListIcon />
            <span className="ml-4">My Expenses</span>
          </NavLink>
        </li>
      </ul>
      <div className="mt-auto">
        <button onClick={handleLogout} className="flex items-center w-full p-4 font-sans text-base font-medium text-gray-600 transition-colors duration-200 ease-in-out bg-transparent border-0 rounded-lg cursor-pointer hover:bg-white/20">
          <LogoutIcon />
          <span className="ml-4">Log Out</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
