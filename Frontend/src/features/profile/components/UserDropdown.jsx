import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
const MotionDiv = motion.div;

function getDisplayName(user) {
  if (user?.fullName?.trim()) return user.fullName.trim();
  if (!user?.username) return 'Neural Operator';

  return user.username
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join(' ');
}

export function UserDropdown({
  user,
  onProfile,
  onSettings,
  onLogout,
  compact = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const handle = user?.username ? `@${user.username}` : '@neural_operator';

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person',
      onClick: onProfile,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'tune',
      onClick: onSettings,
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: 'logout',
      onClick: onLogout,
      danger: true,
    },
  ];

  return (
    <div ref={dropdownRef} className={`user-dropdown relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`user-dropdown-trigger group inline-flex items-center gap-3 rounded-2xl border border-white/8 bg-surface-container-low/90 px-3 py-3 text-left shadow-[0_20px_60px_rgba(4,10,24,0.28)] backdrop-blur-xl transition-all duration-200 ease-out transform-gpu will-change-transform hover:scale-[1.01] hover:border-primary/30 hover:bg-surface-container-high/80 active:scale-[0.99] ${
          compact ? 'justify-center rounded-full p-1.5' : 'w-full'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(90,162,255,0.95),rgba(40,226,255,0.72)_58%,rgba(16,22,38,0.92))] text-sm font-black text-slate-950 shadow-[0_16px_45px_rgba(56,189,248,0.28)]">
          <span>{initials}</span>
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.32),transparent_58%)] opacity-70" />
        </div>

        {!compact && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-on-surface">{displayName}</p>
              <p className="truncate text-xs text-slate-400">{handle}</p>
            </div>
            <span className={`material-symbols-outlined text-lg text-slate-500 transition-all duration-200 group-hover:text-primary ${isOpen ? 'rotate-180' : ''}`}>
              {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={`user-dropdown-menu absolute z-[80] mt-3 min-w-[15rem] origin-top overflow-hidden rounded-3xl border border-white/10 bg-surface-container-high/95 p-2 shadow-[0_35px_80px_rgba(5,9,20,0.52)] backdrop-blur-2xl will-change-transform-opacity ${
              compact ? 'right-0' : 'left-0 right-0'
            }`}
          >
            <div className="rounded-2xl border border-white/5 bg-black/15 px-4 py-3">
              <p className="text-sm font-semibold text-on-surface">{displayName}</p>
              <p className="mt-1 text-xs text-slate-400">{user?.email || 'operator@sanctuary.ai'}</p>
            </div>

            <div className="mt-2 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    item.onClick?.();
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-[1.01] active:scale-[0.99] ${
                    item.danger
                      ? 'text-rose-300 hover:bg-rose-500/10 hover:text-rose-200'
                      : 'text-slate-200 hover:bg-white/6 hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
