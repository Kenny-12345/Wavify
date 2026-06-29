/**
 * ContextMenu.jsx
 * Right-click / more-options context menu.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function ContextMenu({ items, position, onClose }) {
  const menuRef = useRef(null);
  const [submenu, setSubmenu] = useState(null); // { items, index }

  // Adjust position to stay in viewport
  const style = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 200),
    top: Math.min(position.y, window.innerHeight - 300),
    zIndex: 9999,
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('contextmenu', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('contextmenu', handler);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="min-w-48 rounded-xl shadow-2xl overflow-hidden py-1"
      style={{
        ...style,
        background: '#282828',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {items.map((item, i) => {
        if (item.type === 'divider') {
          return <div key={i} className="my-1 border-t border-white/5" />;
        }

        if (item.type === 'submenu') {
          return (
            <div key={i} className="relative">
              <button
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-white/8 transition-colors"
                onMouseEnter={() => setSubmenu({ items: item.items, index: i })}
              >
                {item.label}
                <ChevronRight className="w-3.5 h-3.5 ml-2" />
              </button>

              {submenu?.index === i && (
                <div
                  className="absolute left-full top-0 min-w-40 rounded-xl shadow-2xl overflow-hidden py-1 ml-1"
                  style={{ background: '#282828', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {item.items.map((sub, j) => (
                    <button
                      key={j}
                      className="block w-full text-left px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-white/8 transition-colors truncate"
                      onClick={() => { sub.onClick?.(); onClose(); }}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <button
            key={i}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-white/8 transition-colors"
            onClick={() => { item.onClick?.(); onClose(); }}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            {item.label}
          </button>
        );
      })}
    </motion.div>
  );
}
