// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <Link className="navbar-brand" to="/">Prediction Market</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">Bets</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/my-bets">My Bets</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
