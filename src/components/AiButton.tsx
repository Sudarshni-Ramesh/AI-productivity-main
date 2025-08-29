import React, { useState, useEffect } from 'react';
import { FaRobot } from 'react-icons/fa';
import useAppStore from './state-utils/state-management';

const AiButton: React.FC = () => {
  const [colorIndex, setColorIndex] = useState(0);
  const { isChatEnabled, toggleChatEnabled } = useAppStore();
  const colors = ['text-blue-500', 'text-green-500', 'text-purple-500', 'text-red-500'];

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`ml-4 cursor-pointer h-8 w-8 flex items-center justify-center rounded-full ${
        isChatEnabled ? 'bg-blue-500 text-white' : `${colors[colorIndex]} opacity-75`
      }`}
      onClick={toggleChatEnabled}
    >
      <FaRobot className="h-6 w-6" />
    </div>
  );
};

export default AiButton;