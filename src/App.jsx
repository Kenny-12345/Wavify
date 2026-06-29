/**
 * App.jsx
 * Root component. Mounts the YouTube IFrame player once globally,
 * handles routing, and renders the main layout.
 */
import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { usePlayer } from './context/PlayerContext';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useLibrary } from './context/LibraryContext';

// Layout
import Sidebar from './components/navigation/Sidebar';
import TopBar from './components/navigation/TopBar';
import MobileNav from './components/navigation/MobileNav';
import BottomPlayer from './components/player/BottomPlayer';
import FullscreenPlayer from './components/player/FullscreenPlayer';
import QueuePanel from './components/player/QueuePanel';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// App Pages
import HomePage from './pages/app/HomePage';
import SearchPage from './pages/app/SearchPage';
import LibraryPage from './pages/app/LibraryPage';
import ArtistPage from './pages/app/ArtistPage';
import AlbumPage from './pages/app/AlbumPage';
import PlaylistPage from './pages/app/PlaylistPage';
import GenrePage from './pages/app/GenrePage';
import LikedSongsPage from './pages/app/LikedSongsPage';
import FavoritesPage from './pages/app/FavoritesPage';
import ProfilePage from './pages/app/ProfilePage';
import SettingsPage from './pages/app/SettingsPage';
import HistoryPage from './pages/app/HistoryPage';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Main app layout (sidebar + main content + player)
function AppLayout({ children }) {
  const { showQueue, showFullscreen } = usePlayer();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 overflow-hidden" style={{ paddingBottom: '90px' }}>
        {/* Sidebar — hidden on mobile */}
        <aside className="hidden md:block w-60 flex-shrink-0 h-screen sticky top-0">
          <Sidebar />
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
            {children}
          </main>
        </div>

        {/* Queue panel — slides in from right */}
        {showQueue && (
          <aside className="hidden lg:block w-80 flex-shrink-0 h-screen sticky top-0 border-l border-white/5">
            <QueuePanel />
          </aside>
        )}
      </div>

      {/* Fullscreen player overlay */}
      {showFullscreen && <FullscreenPlayer />}

      {/* Persistent bottom player */}
      <BottomPlayer />

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}

export default function App() {
  const { ytPlayerRef, setIsPlayerReady, currentTrack, isPlaying, nextTrack, setIsPlaying, startProgressTracking } = usePlayer();
  const { addToRecentlyPlayed } = useLibrary();
  const playerDivRef = useRef(null);
  const { theme } = useTheme();

  // Track recently played whenever currentTrack changes
  useEffect(() => {
    if (currentTrack?.id) {
      addToRecentlyPlayed(currentTrack.id);
    }
  }, [currentTrack?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Mount YouTube IFrame API once ────────────────────────────────────────────
  useEffect(() => {
    if (window.YT) {
      initPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = initPlayer;

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function initPlayer() {
    if (!playerDivRef.current) return;
    ytPlayerRef.current = new window.YT.Player(playerDivRef.current, {
      height: '300',
      width: '300',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          setIsPlayerReady(true);
          event.target.setVolume(80);
        },
        onStateChange: (event) => {
          const YT_STATES = window.YT?.PlayerState;
          if (!YT_STATES) return;
          console.log("YouTube Player State Changed:", event.data);
          if (event.data === YT_STATES.PLAYING) {
            setIsPlaying(true);
            startProgressTracking();
          } else if (event.data === YT_STATES.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === YT_STATES.ENDED) {
            nextTrack();
          } else if (event.data === YT_STATES.CUED) {
            console.log("Player is CUED. Autoplaying search result...");
            event.target.playVideo();
          }
        },
        onError: (event) => {
          console.error("YouTube Player Error:", event.data);
          // 150 = restricted, 101 = restricted, 2 = invalid parameter
        },
      },
    });
  }

  return (
    <div className={`${theme}`}>
      {/* Hidden YouTube player container (moved offscreen to bypass size restrictions) */}
      <div id="yt-player-container" style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '300px', height: '300px', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
        <div ref={playerDivRef} id="yt-player" />
      </div>

      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected App Routes */}
        <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><AppLayout><SearchPage /></AppLayout></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><AppLayout><LibraryPage /></AppLayout></ProtectedRoute>} />
        <Route path="/artist/:id" element={<ProtectedRoute><AppLayout><ArtistPage /></AppLayout></ProtectedRoute>} />
        <Route path="/album/:id" element={<ProtectedRoute><AppLayout><AlbumPage /></AppLayout></ProtectedRoute>} />
        <Route path="/playlist/:id" element={<ProtectedRoute><AppLayout><PlaylistPage /></AppLayout></ProtectedRoute>} />
        <Route path="/genre/:id" element={<ProtectedRoute><AppLayout><GenrePage /></AppLayout></ProtectedRoute>} />
        <Route path="/liked-songs" element={<ProtectedRoute><AppLayout><LikedSongsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><AppLayout><FavoritesPage /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><AppLayout><HistoryPage /></AppLayout></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
