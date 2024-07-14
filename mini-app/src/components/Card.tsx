import React from 'react';
import './Card.css';

interface CardProps {
  icon: string;
  title: string;
  description: string;
  address: string;
  links: { type: string; url: string }[];
}


const Card: React.FC<CardProps> = ({icon, title, description, address, links }) => {
    const navigate = useNavigate();
  
    const handleOptInClick = () => {
      navigate(`/single}`);
    };

  return (
    <div className="card">
      <img src={icon} alt={title} className="card-icon" />
      <div className="card-content">
        <h2 className="card-title">{title}</h2>
        <p className="card-description">{description}</p>
        <div className="card-stats">
          <span className="card-address">{address}</span>
        </div>
       
        <button className="card-button" onClick={handleOptInClick}> BET </button>
      </div>
    </div>
  );
};

export default Card;

//amount