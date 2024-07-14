// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BetList from './components/BetList';
import SingleBet from './components/SingleBet';
import MyBets from './components/MyBets';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<BetList />} />
          <Route path="/bet/:id" element={<SingleBet />} />
          <Route path="/my-bets" element={<MyBets />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
