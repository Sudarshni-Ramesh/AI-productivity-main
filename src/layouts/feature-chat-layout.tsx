import React from 'react';
import { Outlet } from 'react-router-dom';
import Chat from '../components/Chat/Chat';
import useAppStore from '../components/state-utils/state-management'; // Import the store

const FeatureChatLayout: React.FC = () => {
  const { isChatEnabled } = useAppStore(); // Access the isChatEnabled state

  return (
    <div className="flex h-screen">
      <div className={`flex-1 overflow-y-auto mt-16 ${isChatEnabled ? 'w-3/4' : 'w-full'}`} style={{ paddingBottom: '30px' }}>
        <Outlet />
      </div>
      {isChatEnabled && (
        <div className="w-1/4 bg-white shadow-md flex flex-col h-full">
          <Chat />
        </div>
      )}
    </div>
  );
};

export default FeatureChatLayout;
