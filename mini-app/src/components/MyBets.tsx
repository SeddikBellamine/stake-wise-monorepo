// src/components/MyBets.tsx
import React from 'react';
import { myBets } from '../mockData';
import './MyBets.css';

const MyBets: React.FC = () => {
  return (
    <div className="bet-list-container">
      <h2 className="mb-4">My Bets</h2>
      <div className="card-list">
        {myBets.map(bet => (
          <div key={bet.id} className="card custom-card mb-3">
            <div className="card-body">
              <h5 className="card-title">{bet.title}</h5>
              <p className="card-text">Amount: ${bet.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyBets;
