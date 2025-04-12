
import React from 'react';
import { Link } from 'react-router-dom';

interface GameCardProps {
  title: string;
  description: string;
  imagePath: string;
  path: string;
  buttonText: string;
  buttonClass: string;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  imagePath,
  path,
  buttonText,
  buttonClass,
}) => {
  return (
    <div className="game-card group">
      <div className="h-40 bg-gradient-to-br from-background to-background/50 flex items-center justify-center p-4">
        <img 
          src={imagePath} 
          alt={title} 
          className="h-28 w-28 object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500" 
        />
      </div>
      
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        
        <div className="pt-2">
          <Link to={path} className={`btn-game ${buttonClass} w-full flex items-center justify-center`}>
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
