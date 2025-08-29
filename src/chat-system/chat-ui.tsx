import React, { useState, useEffect } from 'react';
import { useDBStore } from '../postgres-db/stores';
import { SAMPLE_DATA } from '../postgres-db/postgres/sample-data';

function printDBStoreState() {
  const state = useDBStore.getState();
  console.log("printDBStoreState")
  console.log("Active Connection:", state.active);
  console.log("Databases:");
  // Object.entries(state.databases).forEach(([name, database]) => {
  //   console.log(`- ${name}:`, database);
  // });
}

const ChatUi = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const dbs = useDBStore((state) => state.databases);
  const active = useDBStore((state) => state.active);
  useEffect(() => {
    const importAndQueryData = async () => {
      try {
        // Import sample data
        // useDBStore.getState().connect(database.name);
        printDBStoreState()
        const sampleData = SAMPLE_DATA.find(data => data.key === "orders");
        if (sampleData) {
          // await useDBStore.getState().import(sampleData);
          // console.log("Sample data imported successfully");
          // Query the orders table
          // console.log("dbs:", dbs)
          // console.log("active:", active)
          // const result = await useDBStore.getState().execute("SELECT *, event_start_time AT TIME ZONE 'UTC' AS event_start_time, event_end_time AT TIME ZONE 'UTC' AS event_end_time FROM user_events;");
          const result = await useDBStore.getState().execute("SELECT * from user_events;");


          // const result = await useDBStore.getState().execute("SELECT * FROM students;");
          console.log("chatresults:", result)
          setOrders(result || []);
        }
      } catch (err) {
        setError('Error importing sample data or querying orders');
        console.error('Error:', err);
      }
    };

    importAndQueryData();
  }, []);

  return (
    <div>
      <h1>Orders Table</h1>
      {error && <p>{error}</p>}
      <ul>
        {orders.map((order, index) => (
          <li key={index}>
            {JSON.stringify(order)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatUi;