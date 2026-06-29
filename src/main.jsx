/**
 * main.jsx — Application entry point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import { PlayerProvider } from './context/PlayerContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LibraryProvider>
            <PlayerProvider>
              <App />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#282828',
                    color: '#fff',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '14px',
                  },
                  success: {
                    iconTheme: { primary: 'var(--accent)', secondary: '#fff' },
                  },
                }}
              />
            </PlayerProvider>
          </LibraryProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
