/**
 * MobileNav.jsx
 * Bottom navigation bar for mobile devices.
 */
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, User } from 'lucide-react';

const mobileNavItems = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/liked-songs', icon: Heart, label: 'Liked' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2 safe-area-bottom"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
        // Above the player (player is 72px)
        bottom: '72px',
      }}
    >
      {mobileNavItems.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
              isActive ? 'text-primary' : 'text-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className="w-5 h-5"
                style={isActive ? { color: 'var(--accent)' } : {}}
                fill={isActive ? 'currentColor' : 'none'}
              />
              <span className="text-xs font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
