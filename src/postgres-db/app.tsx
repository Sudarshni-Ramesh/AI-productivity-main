import React, { useState, useEffect } from 'react';
import { useDBStore } from './stores';
import { SAMPLE_DATA } from './postgres/sample-data';
import ChatUi from '../chat-system/chat-ui'; // Assuming ChatUi is a component you want to render

const App = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const importSampleData = async () => {
      try {
        // Import sample data for orders
        const ordersData = SAMPLE_DATA.find(data => data.key === "orders");
        if (ordersData) {
          await useDBStore.getState().import(ordersData);
          console.log("Orders data imported successfully");
        }

        // Import sample data for schools
        const schoolsData = SAMPLE_DATA.find(data => data.key === "schools");
        if (schoolsData) {
          await useDBStore.getState().import(schoolsData);
          console.log("Schools data imported successfully");
        }
      } catch (err) {
        setError('Error importing sample data');
        console.error('Error:', err);
      }
    };

    importSampleData();
  }, []);

  return (
    <div>
      <h1>App Component</h1>
      {error && <p>{error}</p>}
      <ChatUi />
    </div>
  );
};

export default App;
