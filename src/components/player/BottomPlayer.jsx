/**
 * BottomPlayer.jsx
 * Persistent bottom music player with full controls.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Volume1, List, Maximize2, Heart, ChevronUp
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { formatDuration } from '../../services/mockData';

export default function BottomPlayer() {
  const {
    currentTrack, isPlaying, togglePlay,
    nextTrack, prevTrack,
    progress, elapsed, duration,
    seekTo, volume, setVolume, isMuted, toggleMute,
    repeat, cycleRepeat, shuffle, toggleShuffle,
    showQueue, setShowQueue, setShowFullscreen,
  } = usePlayer();
  const { isSongLiked, toggleLikeSong } = useLibrary();

  const [showVolume, setShowVolume] = useState(false);

  if (!currentTrack) return <div className="fixed bottom-0 left-0 right-0 h-[72px]" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)' }} />;

  const liked = isSongLiked(currentTrack.id);

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  const handleSeek = (e) => {
    seekTo(Number(e.target.value));
  };

  const handleVolume = (e) => {
    setVolume(Number(e.target.value));
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 flex flex-col"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
      }}
    >
      {/* Seek bar — at top of player */}
      <div className="px-4 pt-2 pb-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted w-8 text-right tabular-nums">{formatDuration(elapsed)}</span>
          <div className="flex-1 relative group">
            <input
              id="seek-slider"
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={handleSeek}
              className="w-full range-accent h-1 cursor-pointer"
              style={{ '--value': `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted w-8 tabular-nums">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Main player row */}
      <div className="flex items-center px-4 py-2 gap-4">
        {/* Track info */}
        <div
          className="flex items-center gap-3 w-64 flex-shrink-0 cursor-pointer group"
          onClick={() => setShowFullscreen(true)}
        >
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=♪'; }}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="flex items-end gap-0.5 h-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="eq-bar" style={{ height: `${[60,100,40,80][i-1]}%`, animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary truncate group-hover:underline">{currentTrack.title}</p>
            <p className="text-xs text-muted truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Like button */}
        <button
          onClick={() => toggleLikeSong(currentTrack.id)}
          className={`p-1 transition-all hover:scale-110 ${liked ? 'text-accent' : 'text-muted hover:text-primary'}`}
          style={liked ? { color: 'var(--accent)' } : {}}
          title={liked ? 'Unlike' : 'Like'}
        >
          <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
        </button>

        {/* Controls */}
        <div className="flex-1 flex items-center justify-center gap-4">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition-all hover:scale-110 ${shuffle ? 'text-accent' : 'text-muted hover:text-primary'}`}
            style={shuffle ? { color: 'var(--accent)' } : {}}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous */}
          <button
            onClick={prevTrack}
            className="p-1.5 text-secondary hover:text-primary transition-all hover:scale-110"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Play/Pause */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={togglePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold shadow-lg transition-all hover:scale-105"
            style={{ background: 'var(--text-primary)' }}
          >
            {isPlaying
              ? <Pause className="w-5 h-5" fill="currentColor" />
              : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
            }
          </motion.button>

          {/* Next */}
          <button
            onClick={nextTrack}
            className="p-1.5 text-secondary hover:text-primary transition-all hover:scale-110"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            className={`p-1.5 rounded-full transition-all hover:scale-110 ${repeat !== 'off' ? 'text-accent' : 'text-muted hover:text-primary'}`}
            style={repeat !== 'off' ? { color: 'var(--accent)' } : {}}
            title={`Repeat: ${repeat}`}
          >
            <RepeatIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 w-56 justify-end flex-shrink-0">
          {/* Queue */}
          <button
            onClick={() => setShowQueue(prev => !prev)}
            className={`p-1.5 rounded transition-colors ${showQueue ? '' : 'text-muted hover:text-primary'}`}
            style={showQueue ? { color: 'var(--accent)' } : {}}
            title="Queue"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Volume */}
          <div className="relative flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-1.5 text-muted hover:text-primary transition-colors"
            >
              <VolumeIcon className="w-4 h-4" />
            </button>
            <input
              id="volume-slider"
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={handleVolume}
              className="w-20 range-accent h-1 cursor-pointer"
              style={{ '--value': `${isMuted ? 0 : volume}%` }}
            />
          </div>

          {/* Fullscreen */}
          <button
            onClick={() => setShowFullscreen(true)}
            className="p-1.5 text-muted hover:text-primary transition-colors"
            title="Fullscreen player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
