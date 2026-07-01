/**
 * FullscreenPlayer.jsx
 * Expanded/fullscreen player overlay with artwork and controls.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X, ChevronDown, Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Heart, List, Volume2, VolumeX,
  Mic2, Music2
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { formatDuration } from '../../services/mockData';
import { getLyrics } from '../../services/lyricsService';

export default function FullscreenPlayer() {
  const {
    currentTrack, isPlaying, togglePlay,
    nextTrack, prevTrack, progress, elapsed, duration,
    seekTo, volume, setVolume, isMuted, toggleMute,
    repeat, cycleRepeat, shuffle, toggleShuffle,
    setShowFullscreen, setShowQueue,
  } = usePlayer();
  const { isSongLiked, toggleLikeSong } = useLibrary();

  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  useEffect(() => {
    if (!currentTrack) return;
    let active = true;
    setLoadingLyrics(true);
    getLyrics(currentTrack.artist, currentTrack.title).then(data => {
      if (active) {
        setLyrics(data);
        setLoadingLyrics(false);
      }
    });
    return () => { active = false; };
  }, [currentTrack]);

  if (!currentTrack) return null;

  const liked = isSongLiked(currentTrack.id);
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'rgba(10, 10, 10, 0.98)', backdropFilter: 'blur(20px)' }}
    >
      {/* Dynamic background */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={currentTrack.thumbnail}
          alt=""
          className="w-full h-full object-cover scale-110 blur-2xl opacity-20"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-primary) 40%, transparent)' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-lg mx-auto w-full px-6 py-safe">
        {/* Header */}
        <div className="flex items-center justify-between pt-6 pb-4">
          <button
            onClick={() => setShowFullscreen(false)}
            className="p-2 rounded-full hover:bg-white/10 text-secondary hover:text-primary transition-colors"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
          <div className="text-center">
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Now Playing</p>
          </div>
          <button
            onClick={() => { setShowFullscreen(false); setShowQueue(true); }}
            className="p-2 rounded-full hover:bg-white/10 text-secondary hover:text-primary transition-colors"
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Display (Artwork vs Lyrics) */}
        <div className="flex-1 flex items-center justify-center py-6 overflow-hidden">
          {!showLyrics ? (
            <motion.div
              key="artwork"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: isPlaying ? 1 : 0.92, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-72 h-72 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0"
            >
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/288?text=♪'; }}
              />
              {isPlaying && (
                <div className="absolute bottom-3 right-3 flex items-end gap-0.5 h-5">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="eq-bar" style={{ animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="lyrics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full h-full flex flex-col justify-start overflow-y-auto px-4 py-2 glass rounded-2xl border border-white/5 scrollbar-thin"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Mic2 className="w-3.5 h-3.5" /> Lyrics
                </span>
                <button
                  onClick={() => setShowLyrics(false)}
                  className="text-xs text-muted hover:text-primary hover:underline transition-colors"
                >
                  Show Artwork
                </button>
              </div>

              {loadingLyrics ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-muted animate-pulse">Loading lyrics...</p>
                </div>
              ) : (
                <div className="space-y-4 py-2 text-left">
                  {lyrics.map((line, idx) => (
                    <p
                      key={idx}
                      className={`text-lg md:text-xl font-bold transition-all duration-200 ${
                        line.startsWith('[') 
                          ? 'text-muted/60 text-sm font-semibold italic' 
                          : 'text-primary/90 hover:text-white'
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Track info + like */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-primary truncate">{currentTrack.title}</h2>
            <p className="text-base text-muted">{currentTrack.artist}</p>
          </div>
          <button
            onClick={() => toggleLikeSong(currentTrack.id)}
            className={`p-2 ml-4 transition-all hover:scale-110 ${liked ? '' : 'text-muted hover:text-primary'}`}
            style={liked ? { color: 'var(--accent)' } : {}}
          >
            <Heart className="w-6 h-6" fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Seek bar */}
        <div className="mb-4">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full range-accent"
            style={{ '--value': `${progress}%`, height: '4px' }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted tabular-nums">{formatDuration(elapsed)}</span>
            <span className="text-xs text-muted tabular-nums">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-all hover:scale-110 ${shuffle ? '' : 'text-muted hover:text-primary'}`}
            style={shuffle ? { color: 'var(--accent)' } : {}}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button onClick={prevTrack} className="p-2 text-secondary hover:text-primary transition-all hover:scale-110">
            <SkipBack className="w-7 h-7" />
          </button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={togglePlay}
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl text-black transition-all hover:scale-105"
            style={{ background: 'var(--text-primary)' }}
          >
            {isPlaying
              ? <Pause className="w-7 h-7" fill="currentColor" />
              : <Play className="w-7 h-7 ml-1" fill="currentColor" />
            }
          </motion.button>

          <button onClick={nextTrack} className="p-2 text-secondary hover:text-primary transition-all hover:scale-110">
            <SkipForward className="w-7 h-7" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-2 transition-all hover:scale-110 ${repeat !== 'off' ? '' : 'text-muted hover:text-primary'}`}
            style={repeat !== 'off' ? { color: 'var(--accent)' } : {}}
          >
            <RepeatIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={toggleMute} className="text-muted hover:text-primary transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 range-accent"
            style={{ '--value': `${isMuted ? 0 : volume}%`, height: '4px' }}
          />
          <Volume2 className="w-4 h-4 text-muted" />
        </div>

        {/* Lyrics Button */}
        <div className="mb-4 text-center">
          <button
            onClick={() => setShowLyrics(prev => !prev)}
            className="flex items-center gap-2 mx-auto text-sm px-4 py-2 rounded-full transition-all hover:scale-105"
            style={{
              background: showLyrics ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
              color: showLyrics ? 'black' : 'var(--text-secondary)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Mic2 className="w-4 h-4" />
            {showLyrics ? 'Show Album Art' : 'Lyrics'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
