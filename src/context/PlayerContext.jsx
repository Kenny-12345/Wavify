/**
 * PlayerContext.jsx
 * Global music player state using the YouTube IFrame API.
 * The actual YouTube player is mounted once in App.jsx.
 */
import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { settingsStorage } from '../services/storageService';
import { resolveVideoId } from '../services/youtubeService';

const PlayerContext = createContext(null);

// Repeat modes cycle
const REPEAT_MODES = ['off', 'all', 'one'];

export function PlayerProvider({ children }) {
  const ytPlayerRef = useRef(null); // Holds the YT.Player instance

  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState(() => settingsStorage.getQueue());
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(() => settingsStorage.getVolume());
  const [progress, setProgress] = useState(0); // 0-100
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [repeat, setRepeatState] = useState(() => settingsStorage.getRepeat());
  const [shuffle, setShuffleState] = useState(() => settingsStorage.getShuffle());
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const progressInterval = useRef(null);
  const shuffledIndices = useRef([]);

  // ─── Volume ───────────────────────────────────────────────────────────────────
  const setVolume = useCallback((vol) => {
    setVolumeState(vol);
    settingsStorage.setVolume(vol);
    if (ytPlayerRef.current?.setVolume) {
      ytPlayerRef.current.setVolume(vol);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (ytPlayerRef.current) {
        if (next) ytPlayerRef.current.mute?.();
        else ytPlayerRef.current.unMute?.();
      }
      return next;
    });
  }, []);

  // ─── Progress tracking ────────────────────────────────────────────────────────
  const startProgressTracking = useCallback(() => {
    clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (!ytPlayerRef.current) return;
      try {
        const current = ytPlayerRef.current.getCurrentTime?.() || 0;
        const total = ytPlayerRef.current.getDuration?.() || 0;
        if (total > 0) {
          setElapsed(Math.floor(current));
          setDuration(Math.floor(total));
          setProgress((current / total) * 100);
        }
      } catch (_) {/* Player may not be ready */}
    }, 500);
  }, []);

  const stopProgressTracking = useCallback(() => {
    clearInterval(progressInterval.current);
  }, []);

  const playIdRef = useRef(0);

  // ─── Play a specific track ─────────────────────────────────────────────────────
  const playTrack = useCallback((track, newQueue = null) => {
    if (!track) return;

    if (newQueue) {
      setQueue(newQueue);
      settingsStorage.setQueue(newQueue);
      const idx = newQueue.findIndex(t => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    }

    // Generate a unique ID for this play request to prevent race conditions
    playIdRef.current += 1;
    const currentPlayId = playIdRef.current;

    // Set playing track metadata early so UI updates
    setCurrentTrack(track);
    setProgress(0);
    setElapsed(0);
    setIsPlaying(true); // Optimistic play state

    if (ytPlayerRef.current) {
      // Synchronously unlock the browser's autoplay policy!
      if (ytPlayerRef.current.playVideo) {
        ytPlayerRef.current.playVideo();
      }
      
      // Asynchronously resolve the video ID using our internal Vercel/Vite API
      (async () => {
        let videoId = track.videoId;
        if (!videoId) {
          try {
            const { resolveVideoId } = await import('../services/youtubeService');
            videoId = await resolveVideoId(track);
            
            // Abort if the user clicked another song while we were waiting
            if (playIdRef.current !== currentPlayId) return;

            track.videoId = videoId;
            setCurrentTrack(prev => prev && prev.id === track.id ? { ...prev, videoId } : prev);
          } catch (err) {
            console.error('Failed to resolve video ID:', err);
          }
        }

        // Abort if the user clicked another song
        if (playIdRef.current !== currentPlayId) return;

        if (videoId && ytPlayerRef.current?.loadVideoById) {
          ytPlayerRef.current.loadVideoById(videoId);
        } else if (ytPlayerRef.current?.loadPlaylist) {
          console.log('Using YouTube Player built-in search for:', track.title);
          ytPlayerRef.current.loadPlaylist({
            listType: 'search',
            list: `${track.artist} ${track.title} official audio`
          });
        }
        startProgressTracking();
      })();
    }
  }, [startProgressTracking]);

  // ─── Play/Pause ───────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!ytPlayerRef.current || !currentTrack) return;
    if (isPlaying) {
      ytPlayerRef.current.pauseVideo?.();
      setIsPlaying(false);
      stopProgressTracking();
    } else {
      ytPlayerRef.current.playVideo?.();
      setIsPlaying(true);
      startProgressTracking();
    }
  }, [isPlaying, currentTrack, startProgressTracking, stopProgressTracking]);

  // ─── Media Session API (Lock Screen & Background Audio Controls) ──────────────
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || '',
        artwork: [
          { src: currentTrack.thumbnail, sizes: '400x400', type: 'image/jpeg' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      
      // We will set next/prev track handlers in a separate effect because they depend on nextTrack/prevTrack functions
    }
  }, [currentTrack, togglePlay]);

  // ─── Seek ─────────────────────────────────────────────────────────────────────
  const seekTo = useCallback((percent) => {
    if (!ytPlayerRef.current || !duration) return;
    const seconds = (percent / 100) * duration;
    ytPlayerRef.current.seekTo?.(seconds, true);
    setProgress(percent);
    setElapsed(Math.floor(seconds));
  }, [duration]);

  // ─── Next / Prev ──────────────────────────────────────────────────────────────
  const getNextIndex = useCallback((current, queueLen) => {
    if (shuffle && shuffledIndices.current.length) {
      const pos = shuffledIndices.current.indexOf(current);
      return shuffledIndices.current[(pos + 1) % shuffledIndices.current.length];
    }
    return (current + 1) % queueLen;
  }, [shuffle]);

  const getPrevIndex = useCallback((current, queueLen) => {
    if (shuffle && shuffledIndices.current.length) {
      const pos = shuffledIndices.current.indexOf(current);
      return shuffledIndices.current[(pos - 1 + shuffledIndices.current.length) % shuffledIndices.current.length];
    }
    return (current - 1 + queueLen) % queueLen;
  }, [shuffle]);

  const nextTrack = useCallback(() => {
    if (!queue.length) return;
    if (repeat === 'one') {
      ytPlayerRef.current?.seekTo?.(0, true);
      ytPlayerRef.current?.playVideo?.();
      return;
    }
    const nextIdx = getNextIndex(queueIndex, queue.length);
    setQueueIndex(nextIdx);
    playTrack(queue[nextIdx]);
  }, [queue, queueIndex, repeat, getNextIndex, playTrack]);

  const prevTrack = useCallback(() => {
    if (!queue.length) return;
    // If more than 3 seconds in, restart current track
    if (elapsed > 3) {
      seekTo(0);
      return;
    }
    const prevIdx = getPrevIndex(queueIndex, queue.length);
    setQueueIndex(prevIdx);
    playTrack(queue[prevIdx]);
  }, [queue, queueIndex, elapsed, seekTo, getPrevIndex, playTrack]);

  // ─── Bind Media Session Next/Prev Handlers ────────────────────────────────────
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && duration) {
          seekTo((details.seekTime / duration) * 100);
        }
      });
    }
  }, [prevTrack, nextTrack, seekTo, duration]);

  // ─── Repeat ───────────────────────────────────────────────────────────────────
  const cycleRepeat = useCallback(() => {
    const idx = REPEAT_MODES.indexOf(repeat);
    const next = REPEAT_MODES[(idx + 1) % REPEAT_MODES.length];
    setRepeatState(next);
    settingsStorage.setRepeat(next);
  }, [repeat]);

  // ─── Shuffle ──────────────────────────────────────────────────────────────────
  const toggleShuffle = useCallback(() => {
    setShuffleState(prev => {
      const next = !prev;
      settingsStorage.setShuffle(next);
      if (next && queue.length) {
        // Create shuffled index array
        const indices = queue.map((_, i) => i).filter(i => i !== queueIndex);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        shuffledIndices.current = [queueIndex, ...indices];
      } else {
        shuffledIndices.current = [];
      }
      return next;
    });
  }, [queue, queueIndex]);

  // ─── Queue management ─────────────────────────────────────────────────────────
  const addToQueue = useCallback((track) => {
    setQueue(prev => {
      const next = [...prev, track];
      settingsStorage.setQueue(next);
      return next;
    });
  }, []);

  const playNext = useCallback((track) => {
    setQueue(prev => {
      const next = [...prev.slice(0, queueIndex + 1), track, ...prev.slice(queueIndex + 1)];
      settingsStorage.setQueue(next);
      return next;
    });
  }, [queueIndex]);

  const removeFromQueue = useCallback((index) => {
    setQueue(prev => {
      const next = prev.filter((_, i) => i !== index);
      settingsStorage.setQueue(next);
      if (index < queueIndex) setQueueIndex(qi => qi - 1);
      return next;
    });
  }, [queueIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    settingsStorage.setQueue([]);
  }, []);

  const reorderQueue = useCallback((fromIndex, toIndex) => {
    setQueue(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      settingsStorage.setQueue(next);
      return next;
    });
    if (fromIndex === queueIndex) setQueueIndex(toIndex);
    else if (fromIndex < queueIndex && toIndex >= queueIndex) setQueueIndex(qi => qi - 1);
    else if (fromIndex > queueIndex && toIndex <= queueIndex) setQueueIndex(qi => qi + 1);
  }, [queueIndex]);

  const playFromQueue = useCallback((index) => {
    setQueueIndex(index);
    playTrack(queue[index]);
  }, [queue, playTrack]);

  // ─── Cleanup ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => clearInterval(progressInterval.current);
  }, []);

  return (
    <PlayerContext.Provider value={{
      // State
      currentTrack, queue, queueIndex,
      isPlaying, volume, progress, duration, elapsed,
      repeat, shuffle, isPlayerReady, isMuted,
      showQueue, showFullscreen,
      // Refs
      ytPlayerRef,
      // Actions
      playTrack, togglePlay, seekTo,
      nextTrack, prevTrack,
      cycleRepeat, toggleShuffle,
      setVolume, toggleMute,
      addToQueue, playNext, removeFromQueue, clearQueue, reorderQueue, playFromQueue,
      setShowQueue, setShowFullscreen,
      setIsPlaying, setIsPlayerReady,
      startProgressTracking, stopProgressTracking,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
