import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { Clock, CheckSquare, LayoutDashboard } from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import ChatUI from './chat-system/chat-ui';
import FeatureChatLayout from './layouts/feature-chat-layout';
import { auth } from './firebase/config';
import TaskManagement from './components/TaskManagement/TaskManagement';
import Dashboard from './components/Dashboard';
import LockIn from './components/LockIn/LockIn';
import SignInScreen from './components/SignInScreen';
import { useDBStore } from './postgres-db/stores';
import Chat from './components/Chat/Chat';
import { FaRobot } from 'react-icons/fa';
import useAppStore from './components/state-utils/state-management';
import AiButton from './components/AiButton';
import SQLPlayground from './components/SQLPlayground';

// Assuming you have the SQL as a string
const projectSQL = `
CREATE TABLE user_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    project_type VARCHAR(255) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    event_start_time TIMESTAMP NOT NULL,
    event_end_time TIMESTAMP
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_status VARCHAR(50) NULL
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(255) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_status VARCHAR(50) NOT NULL DEFAULT 'Not Started',
    project_id VARCHAR(255) NOT NULL,
    effort VARCHAR(50) NOT NULL
);

ALTER TABLE user_events
ADD CONSTRAINT unique_event_id UNIQUE (event_id);

ALTER TABLE projects
ADD CONSTRAINT unique_project_id UNIQUE (project_id);

ALTER TABLE tasks
ADD CONSTRAINT unique_task_id UNIQUE (task_id);

`;

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const importSampleData = async () => {
      try {
        const dbName = "lockedin";
        const dbDescription = "Sample data for projects";
        const dbStore = useDBStore.getState();

        if (dbStore.databases[dbName]) {
          console.log(`Database ${dbName} already exists.`);
          if (!dbStore.active || dbStore.active.name !== dbName) {
            await dbStore.connect(dbName);
          }
          return;
        }

        await dbStore.create({ name: dbName, description: dbDescription });
        await dbStore.connect(dbName);
        console.log("executing sql")
        await dbStore.execute(projectSQL);

      } catch (err) {
        setError('Error importing sample data');
        console.log('Error:', err);
      }
    };

    importSampleData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const { isChatEnabled, toggleChatEnabled } = useAppStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <SignInScreen />;
  }

  return (
    <Router>
      <div className="h-screen flex flex-col overflow-hidden">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-6 py-3">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <Link to="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                  <Clock className="h-5 w-5 mr-1" />
                  <span>LockIn</span>
                </Link>
                <Link to="/tasks" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                  <CheckSquare className="h-5 w-5 mr-1" />
                  <span>TaskManagement</span>
                </Link>
                <Link to="/dashboard" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                  <LayoutDashboard className="h-5 w-5 mr-1" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/sql-playground" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                  <LayoutDashboard className="h-5 w-5 mr-1" />
                  <span>Playground</span>
                </Link>
              </div>
              <div className="flex items-center">
                <span className="mr-4 text-gray-700">Hello, {user.displayName}</span>
                <button onClick={handleSignOut} className="bg-red-500 text-white px-3 py-2 rounded">
                  Sign Out
                </button>
                <AiButton/>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex-grow overflow-hidden">
          <Routes>
            <Route element={<FeatureChatLayout />}>
              <Route path="/" element={<LockIn />} />
              <Route path="/tasks" element={<TaskManagement />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="/sql-playground" element={<SQLPlayground />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
