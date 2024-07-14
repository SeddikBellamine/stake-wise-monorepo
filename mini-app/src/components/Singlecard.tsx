import React from 'react';
import { useParams } from 'react-router-dom';
import Card from './Card';
import './SingleCardPage.css';

const data = [
  {
    id: 1,
    icon: 'path/to/push_protocol_icon.png',
    title: 'Push Protocol',
    description: 'Push Protocol is a web3 communication network, enabling cross-chain notifications and messaging for dapps, wallets, and services.',
    users: 81535,
    address: '0xB8...30689D',
    links: []
  },
  {
    id: 2,
    icon: 'path/to/shapeshift_icon.png',
    title: 'ShapeShift',
    description: 'All Chains, All protocols, All Wallets 👉 https://app.shapeshift.com Join our community 🦊 https://discord.gg/shapeshift',
    users: 28527,
    address: '0x90...E551Be',
    links: [
      { type: 'GitHub', url: 'https://github.com/shapeshift' }
    ]
  },
  {
    id: 3,
    icon: 'path/to/eth_tracker_icon.png',
    title: 'ETH Tracker',
    description: 'We track $ETH prices every 6 hours so that you don’t have to.',
    users: 16825,
    address: '0xDB...553F2F',
    links: [
      { type: 'Tutorial', url: 'https://tutorial-link.com' }
    ]
  }
];

const SingleCardPage: React.FC = () => {
  const { id } = useParams();
  const card = data.find((item) => item.id.toString() === id);

  if (!card) {
    return <div>Card not found</div>;
  }

  return (
    <div className="single-card-page">
      <Card {...card} />
    </div>
  );
};

export default SingleCardPage;
