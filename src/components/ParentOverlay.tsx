import { useState, useEffect } from 'react';
import { useParentPresence } from '@/hooks/useParentPresence';
import { characters } from '@/data/characters';

interface Props {
  onDismiss: () => void;
  type: 'greeting' | 'checkin' | 'lockout';
}

export function ParentOverlay({ onDismiss, type }: Props) {
  const { settings, getRandomGreeting, getRandomLockout, getRandomCheckIn } = useParentPresence();
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  // Get parent character portrait
  const parentChar = characters.find(c => c.slug === settings.persona) || characters.find(c => c.slug === 'mamma');

  useEffect(() => {
    if (settings.persona === 'none') {
      onDismiss();
      return;
    }

    let msg = '';
    switch (type) {
      case 'greeting':
        msg = getRandomGreeting();
        break;
      case 'checkin':
        msg = getRandomCheckIn();
        break;
      case 'lockout':
        msg = getRandomLockout();
        break;
    }
    setMessage(msg);

    // Animate in
    requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss for greeting/checkin (not lockout)
    if (type !== 'lockout') {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [type, settings.persona]);

  if (!parentChar) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center pb-24 px-4"
      style={{
        background: visible ? 'rgba(0,0,0,0.6)' : 'transparent',
        transition: 'background 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
      onClick={type !== 'lockout' ? onDismiss : undefined}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 border relative"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          borderColor: `${parentChar.accentColor}60`,
          boxShadow: `0 0 30px ${parentChar.accentColor}30`,
          transform: visible ? 'translateY(0)' : 'translateY(100px)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        {/* Parent avatar + name */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
            style={{
              border: `2px solid ${parentChar.accentColor}`,
              boxShadow: `0 0 12px ${parentChar.accentColor}40`,
            }}
          >
            <img
              src={parentChar.portrait}
              alt={settings.persona}
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = 'none';
                el.parentElement!.style.background = 'linear-gradient(135deg, #D4A85340, #D4A85320)';
                el.parentElement!.innerHTML = '<span style="color:#D4A853;font-size:1.2rem;font-weight:700;">M</span>';
              }}
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm capitalize">{settings.persona}</p>
            <p className="text-white/40 text-xs">
              {type === 'greeting' && 'Just checking in!'}
              {type === 'checkin' && 'How are you doing?'}
              {type === 'lockout' && 'Time for a break!'}
            </p>
          </div>
        </div>

        {/* Message */}
        <p className="text-white text-base leading-relaxed mb-4">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {type === 'lockout' ? (
            <button
              onClick={onDismiss}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${parentChar?.accentColor || '#D4A853'}, #f59e0b)`,
                boxShadow: `0 4px 16px ${parentChar?.accentColor || '#D4A853'}40`,
              }}
            >
              Okay, goodbye! 👋
            </button>
          ) : (
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(onDismiss, 300);
              }}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold text-sm border border-white/10 hover:bg-white/20 transition-all active:scale-95"
            >
              Thanks! 💕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
