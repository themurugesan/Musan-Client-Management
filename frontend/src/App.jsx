import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/MCM/Login';
import Dashboard from './components/MCM/Dashboard';
import ReachoutTracker from './components/MCM/ReachoutTracker';
import Layout from './components/MCM/Layout';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />


        <Route
          path="/dashboard"
          element={
            token ? (
              <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <Dashboard />
              </Layout>
            ) : <Navigate to="/login" />
          }
        />


        <Route
          path="/reachout"
          element={
            token ? (
              <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <ReachoutTracker />
              </Layout>
            ) : <Navigate to="/login" />
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;