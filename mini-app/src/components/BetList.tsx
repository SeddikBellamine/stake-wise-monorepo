// src/components/BetList.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { bets } from '../mockData';
import './BetList.css';

const BetList: React.FC = () => {
  return (
    <div className="bet-list-container">
      <h2 className="mb-4">Available Bets</h2>
      <div className="card-list">
        {bets.map(bet => (
          <div key={bet.id} className="card custom-card mb-3">
            <div className="card-body">
              <Link to={`/bet/${bet.id}`} className="card-title">{bet.title}</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BetList;
