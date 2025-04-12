
import React, { useEffect, useState } from 'react';

interface RainDropProps {
  delay: number;
}

const RainDrop: React.FC<RainDropProps> = ({ delay }) => {
  const style = {
    '--random': Math.random(),
    animationDelay: `${delay}ms`,
  } as React.CSSProperties;

  return <div className="rain-animation" style={style} />;
};

const RainAnimation: React.FC = () => {
  const [drops, setDrops] = useState<number[]>([]);

  useEffect(() => {
    // Create 50 raindrops with random delays
    const rainDrops = Array.from({ length: 50 }, (_, i) => i).map(
      () => Math.random() * 3000 // Random delay up to 3 seconds
    );
    
    setDrops(rainDrops);
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {drops.map((delay, index) => (
        <RainDrop key={index} delay={delay} />
      ))}
    </div>
  );
};

export default RainAnimation;
