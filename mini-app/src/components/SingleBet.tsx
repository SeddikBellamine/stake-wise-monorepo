// src/components/SingleBet.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { betDetails } from '../mockData';

const SingleBet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bet, setBet] = useState(betDetails);
  const [collateral, setCollateral] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handlePlaceBet = () => {
    // Logic to place bet with collateral
    console.log(`Placing bet with ${collateral} collateral`);
    console.log(`Selected option: ${selectedOption}`);
  };

  if (!bet) return <div>Loading...</div>;

  return (
    <div>
      <h2>{bet.title}</h2>
      <div className="form-group">
        <label>Select Option</label>
        <select
          className="form-control"
          value={selectedOption || ''}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="" disabled>Select an option</option>
          {bet.options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Collateral</label>
        <input
          type="number"
          className="form-control"
          value={collateral}
          onChange={(e) => setCollateral(Number(e.target.value))}
        />
      </div>
      <button className="btn btn-primary" onClick={handlePlaceBet}>Place Bet</button>
    </div>
  );
}

export default SingleBet;
