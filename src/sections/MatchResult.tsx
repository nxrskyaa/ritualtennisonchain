import { useState, useEffect } from 'react';
import { Star, Trophy, Zap, ChevronRight, Home, RotateCcw } from 'lucide-react';
import type { AIPersonality } from '@/types/game';

interface Props {
  result: {
    winner: 'player' | 'ai';
    playerScore: number;
    aiScore: number;
    maxRally: number;
    levelId: number;
    aiPersonality: AIPersonality;
  };
  onNextLevel: () => void;
  onRetry: () => void;
  onMenu: () => void;
  hasNextLevel: boolean;
}

export default function MatchResult({ result, onNextLevel, onRetry, onMenu, hasNextLevel }: Props) {
  const [showStars, setShowStars] = useState(0);
  const [showCard, setShowCard] = useState(false);

  // Star calculation
  let earnedStars = 0;
  if (result.winner === 'player') {
    if (result.playerScore === 3 && result.aiScore === 0) earnedStars = 3;
    else if (result.playerScore === 3 && result.aiScore === 1) earnedStars = 2;
    else if (result.playerScore > result.aiScore) earnedStars = 1;
  }
  const finalStars = Math.min(3, earnedStars + (result.maxRally >= 10 ? 1 : 0));

  // Rarity
  const rarity = finalStars === 3 ? 'EPIC' : finalStars === 2 ? 'RARE' : finalStars === 1 ? 'COMMON' : 'NONE';
  const rarityColor = finalStars === 3 ? '#ff44ff' : finalStars === 2 ? '#39ff14' : finalStars === 1 ? '#888' : '#444';

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= finalStars; i++) timers.push(setTimeout(() => setShowStars(i), i * 400));
    timers.push(setTimeout(() => setShowCard(true), finalStars * 400 + 600));
    return () => timers.forEach(clearTimeout);
  }, [finalStars]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1a0d 100%)' }}>
      <div className="max-w-sm w-full flex flex-col items-center">

        {/* Win/Lose */}
        {result.winner === 'player' ? (
          <div className="text-center mb-3">
            <Trophy className="w-14 h-14 text-[#39ff14] mx-auto mb-2" style={{ filter: 'drop-shadow(0 0 15px rgba(57,255,20,0.5))' }} />
            <h2 className="text-3xl font-extrabold text-[#39ff14]" style={{ textShadow: '0 0 20px rgba(57,255,20,0.5)', fontFamily: '"Fredoka One", sans-serif' }}>
              VICTORY
            </h2>
          </div>
        ) : (
          <div className="text-center mb-3">
            <Zap className="w-14 h-14 text-red-400 mx-auto mb-2" />
            <h2 className="text-3xl font-extrabold text-red-400" style={{ fontFamily: '"Fredoka One", sans-serif' }}>DEFEAT</h2>
          </div>
        )}

        {/* Score */}
        <div className="text-3xl font-bold font-mono text-white mb-1">
          {result.playerScore} <span className="text-white/30">-</span> {result.aiScore}
        </div>
        <p className="text-white/40 text-xs mb-3">Max Rally: {result.maxRally} hits</p>

        {/* Stars */}
        <div className="flex gap-3 mb-5">
          {[1, 2, 3].map(s => (
            <Star key={s} size={32} className={`transition-all duration-500 ${s <= showStars ? 'text-[#39ff14] fill-[#39ff14] scale-110' : 'text-white/10'}`}
                  style={{ filter: s <= showStars ? 'drop-shadow(0 0 8px rgba(57,255,20,0.6))' : 'none', transitionDelay: `${s * 100}ms` }} />
          ))}
        </div>

        {/* NFT Reward Card */}
        {showCard && result.winner === 'player' && (
          <div className="relative w-52 h-72 mb-5 rounded-xl overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, #0f1a0f 0%, #1a0f1a 50%, #0f0a1a 100%)',
                 border: `2px solid ${rarityColor}`,
                 boxShadow: `0 0 20px ${rarityColor}40, inset 0 0 30px rgba(0,0,0,0.5)`,
               }}>

            {/* Rarity badge */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
                 style={{ background: rarityColor + '30', color: rarityColor, border: `1px solid ${rarityColor}60` }}>
              {rarity}
            </div>

            {/* Level badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#39ff14]/10 text-[#39ff14] text-[9px] font-bold border border-[#39ff14]/20">
              Lv.{result.levelId}
            </div>

            {/* Card content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              {/* Player image */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 mb-2 flex items-center justify-center"
                   style={{ borderColor: rarityColor, boxShadow: `0 0 10px ${rarityColor}40` }}>
                <img src="/assets/player.png" alt="" className="w-full h-full object-cover" />
              </div>

              {/* Title */}
              <p className="text-white font-bold text-xs mb-0.5">LEVEL {result.levelId} CLEARED</p>
              <p className="text-white/50 text-[10px] mb-2">vs {result.aiPersonality.name}</p>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: finalStars }).map((_, i) => (
                  <Star key={i} size={12} className="text-[#39ff14] fill-[#39ff14]" />
                ))}
              </div>

              {/* Stats */}
              <div className="w-full space-y-1.5">
                {[
                  { label: 'PWR', val: [70, 80, 90][finalStars - 1] || 50 },
                  { label: 'SPD', val: [60, 75, 85][finalStars - 1] || 45 },
                  { label: 'SKL', val: [75, 85, 95][finalStars - 1] || 55 },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="text-white/40 text-[8px] w-5 font-mono">{s.label}</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.val}%`, background: rarityColor, transitionDelay: '500ms' }} />
                    </div>
                    <span className="text-white/40 text-[8px] w-5 text-right font-mono">{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Timestamp */}
              <p className="text-white/20 text-[8px] mt-2 font-mono">{new Date().toLocaleDateString()}</p>
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: rarityColor }} />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: rarityColor }} />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: rarityColor }} />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: rarityColor }} />
          </div>
        )}

        {/* Buttons */}
        <div className="w-full max-w-xs space-y-2">
          {result.winner === 'player' && hasNextLevel && (
            <button onClick={onNextLevel} className="w-full h-11 rounded-xl bg-[#39ff14] text-black font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(57,255,20,0.3)]">
              NEXT LEVEL <ChevronRight size={16} />
            </button>
          )}
          <button onClick={onRetry} className="w-full h-10 rounded-xl bg-white/5 border border-[#39ff14]/20 text-white hover:bg-[#39ff14]/10 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
            <RotateCcw size={14} /> RETRY
          </button>
          <button onClick={onMenu} className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
            <Home size={14} /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
