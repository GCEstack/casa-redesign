import { useState } from 'react';
import { useParentalControl } from '@/hooks/useParentalControl';
import { ArrowLeft, Lock, Mic, Volume2, Bell, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onBack: () => void;
}

export function SettingsPage({ onBack }: Props) {
  const {
    settings,
    isAuthenticated,
    authError,
    authenticate,
    lock,
    updateSettings,
    setPin,
  } = useParentalControl();

  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleAuth = () => {
    authenticate(pinInput);
  };

  const handleSetPin = () => {
    if (newPin.length >= 4) {
      setPin(newPin);
      setNewPin('');
    }
  };

  if (!isAuthenticated && settings.pinEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-neutral-950">
        <div className="w-full max-w-xs">
          <Lock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white text-center mb-1">Parent Settings</h2>
          <p className="text-white/40 text-sm text-center mb-6">
            Enter your PIN to access settings
          </p>

          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            placeholder="••••"
            className="w-full h-14 text-center text-2xl tracking-[0.5em] rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 mb-3"
          />

          {authError && (
            <p className="text-red-400 text-xs text-center mb-3">{authError}</p>
          )}

          <button
            onClick={handleAuth}
            className="w-full h-12 rounded-xl bg-amber-500 text-neutral-950 font-semibold active:scale-[0.98] transition-transform"
          >
            Unlock
          </button>

          <button
            onClick={onBack}
            className="w-full mt-3 text-white/30 text-sm hover:text-white/50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(30, 41, 59, 0.9)' }}>
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">Settings</h1>
        {isAuthenticated && (
          <button
            onClick={lock}
            className="ml-auto w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10"
          >
            <Lock className="w-4 h-4 text-white/40" />
          </button>
        )}
      </header>

      <div className="px-4 pt-4 space-y-6">
        {/* Voice Controls */}
        <section>
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
            Voice Controls
          </h3>
          <div className="space-y-2">
            <ToggleRow
              icon={<Volume2 className="w-5 h-5" />}
              label="Voice Output"
              description="Character speaks responses"
              value={settings.voiceOutput}
              onChange={(v) => updateSettings({ voiceOutput: v })}
            />
            <ToggleRow
              icon={<Bell className="w-5 h-5" />}
              label="Wake Word"
              description={"Say \"Hey Casa\" to start"}
              value={settings.wakeWord}
              onChange={(v) => updateSettings({ wakeWord: v })}
            />
            <ToggleRow
              icon={<Mic className="w-5 h-5" />}
              label="Jump In"
              description="Interrupt while speaking"
              value={settings.jumpIn}
              onChange={(v) => updateSettings({ jumpIn: v })}
            />
          </div>
        </section>

        {/* Parental Controls */}
        <section>
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
            Parental Controls
          </h3>
          <div className="space-y-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <label className="text-sm text-white mb-2 block">Parent PIN</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Set a 4-6 digit PIN"
                  className="flex-1 h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-500/40"
                />
                <button
                  onClick={handleSetPin}
                  disabled={newPin.length < 4}
                  className="px-4 h-10 rounded-lg bg-amber-500 text-neutral-950 text-sm font-medium disabled:opacity-30 active:scale-95 transition-transform"
                >
                  Set
                </button>
              </div>
              {settings.pinEnabled && (
                <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> PIN is active
                </p>
              )}
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white/40" />
                  <div>
                    <p className="text-sm text-white">Daily Time Limit</p>
                    <p className="text-xs text-white/40">{settings.dailyLimitMinutes} minutes</p>
                  </div>
                </div>
                <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                  {settings.timeUsedMinutes}m used
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={180}
                step={10}
                value={settings.dailyLimitMinutes}
                onChange={(e) => updateSettings({ dailyLimitMinutes: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-white/20 mt-1">
                <span>10m</span>
                <span>180m</span>
              </div>
            </div>
          </div>
        </section>

        {/* Session Info */}
        <section>
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
            Session Info
          </h3>
          <div className="rounded-xl bg-white/5 border border-white/10 divide-y divide-white/5">
            <InfoRow label="Status" value="Online" valueColor="text-green-400" />
            <InfoRow label="Messages" value="0 this session" />
            <InfoRow label="Voice Pipeline" value="Deepgram → GPT-4o → OpenAI TTS" />
            <InfoRow label="Estimated Cost" value="$0.00" />
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h3 className="text-xs font-semibold text-red-400/60 uppercase tracking-wider mb-3">
            Danger Zone
          </h3>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full rounded-xl bg-red-500/5 border border-red-500/10 p-4 flex items-center gap-3 text-left active:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-red-400">Reset All Data</p>
                <p className="text-xs text-red-400/40">Clear conversations and settings</p>
              </div>
            </button>
          ) : (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">
                  This will delete all conversations and reset settings. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="flex-1 h-10 rounded-lg bg-red-500 text-white text-sm font-medium active:scale-95 transition-transform"
                >
                  Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 h-10 rounded-lg bg-white/5 text-white text-sm active:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-white/20 text-xs">Casa Companion v1.0</p>
          <p className="text-white/10 text-[10px] mt-1">Powered by voice</p>
        </div>
      </div>
    </div>
  );
}

/* Sub-components */

function ToggleRow({
  icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 p-3">
      <div className="flex items-center gap-3">
        <span className="text-white/30">{icon}</span>
        <div>
          <p className="text-sm text-white">{label}</p>
          <p className="text-xs text-white/30">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'w-12 h-7 rounded-full transition-colors relative',
          value ? 'bg-amber-500' : 'bg-white/10',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform',
            value ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueColor = 'text-white/50',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-white/40">{label}</span>
      <span className={cn('text-sm', valueColor)}>{value}</span>
    </div>
  );
}
