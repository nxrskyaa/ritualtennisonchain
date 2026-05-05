import { ArrowLeft, Lock, Star, Zap, Clock, Wind, CircleDot, Shrink, Eye, Crown, Hexagon } from 'lucide-react';
import type { LevelProgress } from '@/types/game';
import { LEVELS } from '@/config/ritual';

interface LevelSelectProps {
  levelProgress: Record<number, LevelProgress>;
  isLevelUnlocked: (levelId: number) => boolean;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

const levelIcons: Record<number, React.ReactNode> = {
  1: <Zap size={20} />, 2: <Star size={20} />, 3: <Wind size={20} />,
  4: <Clock size={20} />, 5: <Hexagon size={20} />, 6: <CircleDot size={20} />,
  7: <Shrink size={20} />, 8: <Eye size={20} />, 9: <Crown size={20} />, 10: <Crown size={20} />,
};

export default function LevelSelect({ levelProgress, isLevelUnlocked, onSelectLevel, onBack }: LevelSelectProps) {
  const totalStars = Object.values(levelProgress).reduce((sum, p) => sum + p.stars, 0);
  const maxStars = LEVELS.length * 3;

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1a0d 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/60 hover:text-[#39ff14] transition-colors bg-white/5 hover:bg-[#39ff14]/10 rounded-lg px-3 py-2 border border-white/10 hover:border-[#39ff14]/30">
          <ArrowLeft size={18} /> <span className="text-sm font-bold">BACK</span>
        </button>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: '"Fredoka One", sans-serif' }}>SELECT LEVEL</h1>
        <div className="flex items-center gap-1 bg-[#39ff14]/10 rounded-full px-3 py-1 border border-[#39ff14]/20">
          <Star size={12} className="text-[#39ff14] fill-[#39ff14]" />
          <span className="text-[#39ff14] font-bold text-xs">{totalStars}/{maxStars}</span>
        </div>
      </div>

      {/* Level Grid */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {LEVELS.map((level) => {
          const unlocked = isLevelUnlocked(level.id);
          const progress = levelProgress[level.id];
          const stars = progress?.stars || 0;

          return (
            <button key={level.id} onClick={() => unlocked && onSelectLevel(level.id)} disabled={!unlocked}
              className={`relative rounded-xl p-4 transition-all duration-200 text-left
                ${unlocked
                  ? 'bg-white/5 border border-[#39ff14]/20 hover:bg-[#39ff14]/10 hover:scale-105 hover:border-[#39ff14]/40 cursor-pointer'
                  : 'bg-white/[0.02] border border-white/5 cursor-not-allowed opacity-50'
                }`}>
              {/* Level badge */}
              <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                ${unlocked ? 'bg-[#39ff14] text-black' : 'bg-white/10 text-white/30'}`}>
                {level.id}
              </div>

              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                  <Lock size={20} className="text-white/20" />
                </div>
              )}

              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${unlocked ? 'text-[#39ff14]' : 'text-white/20'}`}
                   style={unlocked ? { filter: 'drop-shadow(0 0 4px rgba(57,255,20,0.4))' } : {}}>
                {levelIcons[level.id] || <Star size={20} />}
              </div>

              <h3 className={`text-sm font-bold ${unlocked ? 'text-white' : 'text-white/30'}`}>{level.name}</h3>
              <p className="text-[10px] text-white/40 mt-0.5">{level.description}</p>

              {unlocked && (
                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3].map(s => (
                    <Star key={s} size={11} className={s <= stars ? 'text-[#39ff14] fill-[#39ff14]' : 'text-white/10'} />
                  ))}
                </div>
              )}

              {unlocked && level.targetScore < 99 && <p className="text-[9px] text-white/30 mt-1">First to {level.targetScore}</p>}
              {unlocked && level.timeLimit > 0 && <p className="text-[9px] text-white/30 mt-1">{level.timeLimit}s</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
