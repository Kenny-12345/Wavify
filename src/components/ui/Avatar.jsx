/**
 * Avatar.jsx — User profile avatar component
 */
export default function Avatar({ user, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-4xl',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getBgColor = (name) => {
    const colors = [
      'from-purple-500 to-indigo-600',
      'from-pink-500 to-rose-600',
      'from-cyan-500 to-blue-600',
      'from-orange-500 to-red-600',
      'from-green-500 to-teal-600',
      'from-yellow-500 to-amber-600',
    ];
    if (!name) return colors[0];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name || 'User'}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br ${getBgColor(user?.name)} flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
    >
      {getInitials(user?.name)}
    </div>
  );
}
