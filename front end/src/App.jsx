
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import EditorScreen from './components/EditorScreen';
import AuthModal from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState('landing');
  const [difficulty, setDifficulty] = useState('easy');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingEditor, setPendingEditor] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const handleAuthSuccess = (authUser, authToken) => {
    setUser(authUser);
    setToken(authToken);

    localStorage.setItem('user', JSON.stringify(authUser));
    localStorage.setItem('token', authToken);

    setIsAuthOpen(false);

    if (pendingEditor) {
      setView('editor');
      setPendingEditor(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    setUser(null);
    setToken(null);
    setPendingEditor(false);
    setIsAuthOpen(false);
    setView('landing');
  };

  const handleSelectDifficulty = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);

    if (!user) {
      setPendingEditor(true);
      setIsAuthOpen(true);
      return;
    }

    setView('editor');
  };

  const handleStartCoding = () => {
    if (!user) {
      setPendingEditor(true);
      setIsAuthOpen(true);
      return;
    }

    setView('editor');
  };

  const handleAuthClose = () => {
    setIsAuthOpen(false);
    setPendingEditor(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      {view === 'landing' ? (
        <LandingPage
          user={user}
          onLogout={handleLogout}
          onOpenAuth={() => setIsAuthOpen(true)}
          onSelectDifficulty={handleSelectDifficulty}
          onStartCoding={handleStartCoding}
        />
      ) : (
        <EditorScreen
          initialDifficulty={difficulty}
          user={user}
          token={token}
          onBackToLanding={() => setView('landing')}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleAuthClose}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
