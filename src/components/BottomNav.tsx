import { Home, MessageCircle, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Props {
  active: 'home' | 'chat' | 'settings';
  hasChat?: boolean;
}

export function BottomNav({ active, hasChat }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-md bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex items-center justify-around">
        <button
          onClick={() => navigate('/home')}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors',
            active === 'home' ? 'text-amber-400' : 'text-white/40',
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => hasChat && navigate(location.pathname.startsWith('/chat') ? location.pathname : '/chat')}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors',
            active === 'chat' ? 'text-amber-400' : 'text-white/40',
            !hasChat && 'opacity-30 cursor-not-allowed',
          )}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">Chat</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors',
            active === 'settings' ? 'text-amber-400' : 'text-white/40',
          )}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </nav>
  );
}
