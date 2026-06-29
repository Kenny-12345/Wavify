/**
 * QueuePanel.jsx
 * Sidebar queue panel showing Up Next tracks.
 */
import { X, GripVertical, Trash2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function QueuePanel() {
  const {
    queue, queueIndex, currentTrack,
    playFromQueue, removeFromQueue, clearQueue,
    setShowQueue,
  } = usePlayer();

  const upNext = queue.slice(queueIndex + 1);

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <h3 className="font-bold text-primary">Queue</h3>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="text-xs text-muted hover:text-primary transition-colors px-2 py-1 hover:bg-white/5 rounded"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setShowQueue(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {/* Now playing */}
        {currentTrack && (
          <div className="mb-3">
            <p className="px-2 py-1 text-xs font-semibold text-muted uppercase tracking-wider">Now Playing</p>
            <div
              className="flex items-center gap-3 px-2 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-10 h-10 rounded object-cover flex-shrink-0"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=♪'; }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary truncate">{currentTrack.title}</p>
                <p className="text-xs text-muted truncate">{currentTrack.artist}</p>
              </div>
            </div>
          </div>
        )}

        {/* Up next */}
        {upNext.length > 0 && (
          <div>
            <p className="px-2 py-1 text-xs font-semibold text-muted uppercase tracking-wider">Up Next</p>
            <AnimatePresence>
              {upNext.map((track, i) => {
                const realIndex = queueIndex + 1 + i;
                return (
                  <motion.div
                    key={`${track.id}-${realIndex}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => playFromQueue(realIndex)}
                  >
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=♪'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{track.title}</p>
                      <p className="text-xs text-muted truncate">{track.artist}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromQueue(realIndex); }}
                      className="p-1 opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {upNext.length === 0 && !currentTrack && (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-sm text-muted text-center">Your queue is empty.<br />Play a song to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
