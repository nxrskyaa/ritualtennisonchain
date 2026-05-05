import { ArrowLeft, Volume2, VolumeX, Music, Gauge, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { GameSettings, Difficulty } from '@/types/game';

interface SettingsProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onBack: () => void;
}

export default function Settings({ settings, onUpdateSettings, onBack }: SettingsProps) {
  const toggleSound = () => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  const toggleMusic = () => onUpdateSettings({ ...settings, musicEnabled: !settings.musicEnabled });
  const toggleFPS = () => onUpdateSettings({ ...settings, showFPS: !settings.showFPS });
  
  const setDifficulty = (difficulty: Difficulty) => {
    onUpdateSettings({ ...settings, difficulty });
  };

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft size={24} />
        </Button>
        
        <h1 className="text-2xl font-bold text-white"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          SETTINGS
        </h1>
        
        <div className="w-10" />
      </div>
      
      <div className="max-w-md mx-auto w-full space-y-4">
        {/* Sound */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-orange-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-white/40" />
              )}
              <span className="text-white font-medium">Sound Effects</span>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={toggleSound}
            />
          </div>
        </div>
        
        {/* Music */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className={`w-5 h-5 ${settings.musicEnabled ? 'text-orange-400' : 'text-white/40'}`} />
              <span className="text-white font-medium">Music</span>
            </div>
            <Switch
              checked={settings.musicEnabled}
              onCheckedChange={toggleMusic}
            />
          </div>
        </div>
        
        {/* Difficulty */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <Gauge className="w-5 h-5 text-orange-400" />
            <span className="text-white font-medium">Difficulty</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`
                  py-2 px-4 rounded-xl font-bold text-sm capitalize transition-all
                  ${settings.difficulty === diff
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }
                `}
              >
                {diff}
              </button>
            ))}
          </div>
          
          <p className="text-white/40 text-xs mt-2">
            {settings.difficulty === 'easy' && 'Slower AI, easier to win'}
            {settings.difficulty === 'medium' && 'Balanced gameplay'}
            {settings.difficulty === 'hard' && 'Fast AI, challenging matches'}
          </p>
        </div>
        
        {/* FPS Counter */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className={`w-5 h-5 ${settings.showFPS ? 'text-orange-400' : 'text-white/40'}`} />
              <span className="text-white font-medium">Show FPS</span>
            </div>
            <Switch
              checked={settings.showFPS}
              onCheckedChange={toggleFPS}
            />
          </div>
        </div>
        
        {/* Reset Progress */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-red-500/20">
          <Button
            onClick={() => {
              if (confirm('Are you sure you want to reset all progress?')) {
                localStorage.removeItem('racket_level_progress');
                localStorage.removeItem('racket_settings');
                window.location.reload();
              }
            }}
            variant="destructive"
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
          >
            Reset All Progress
          </Button>
        </div>
      </div>
    </div>
  );
}
