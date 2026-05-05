import { ArrowLeft, Star, Trophy, Crown, Medal, Zap } from 'lucide-react';
import type { LevelProgress } from '@/types/game';

interface LeaderboardProps {
  levelProgress: Record<number, LevelProgress>;
  onBack: () => void;
}

const GLOBAL_RANKINGS = [
  { rank: 1, name: 'Nxrskyaa', stars: 30, wins: 45, level: 10 },
  { rank: 2, name: 'EvoYudha', stars: 28, wins: 38, level: 10 },
  { rank: 3, name: 'Rizan', stars: 26, wins: 35, level: 9 },
  { rank: 4, name: 'JohnTOL', stars: 24, wins: 32, level: 9 },
  { rank: 5, name: 'AceHunter', stars: 22, wins: 28, level: 8 },
  { rank: 6, name: 'LunaStrike', stars: 20, wins: 25, level: 8 },
  { rank: 7, name: 'TitanCore', stars: 18, wins: 22, level: 7 },
  { rank: 8, name: 'SparkBot', stars: 16, wins: 19, level: 7 },
  { rank: 9, name: 'NeonAce', stars: 14, wins: 17, level: 6 },
  { rank: 10, name: 'RitualRally', stars: 12, wins: 15, level: 6 },
];

export default function Leaderboard({ levelProgress, onBack }: LeaderboardProps) {
  const totalStars = Object.values(levelProgress).reduce((sum, p) => sum + p.stars, 0);
  const completed = Object.values(levelProgress).filter(p => p.completed).length;
  const maxLevel = completed > 0 ? Math.max(...Object.entries(levelProgress).filter(([,p]) => p.completed).map(([id]) => Number(id))) : 0;

  // Insert player into rankings based on their stars
  const savedName = localStorage.getItem('ritual_username');
  const playerName = savedName || 'You';
  const playerEntry = {
    rank: 0,
    name: playerName,
    stars: totalStars,
    wins: completed,
    level: maxLevel,
  };

  type RankEntry = typeof GLOBAL_RANKINGS[0] & { isPlayer?: boolean };

  // Build final list with player inserted
  let finalList: RankEntry[] = [...GLOBAL_RANKINGS];
  if (totalStars > 0) {
    const insertIndex = finalList.findIndex(e => totalStars >= e.stars);
    if (insertIndex === -1) {
      finalList.push({ ...playerEntry, isPlayer: true });
    } else {
      finalList.splice(insertIndex, 0, { ...playerEntry, isPlayer: true });
    }
    finalList = finalList.map((e, i) => ({ ...e, rank: i + 1 })).slice(0, 10);
  }

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1a0d 100%)' }}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/60 hover:text-[#39ff14] transition-colors bg-white/5 hover:bg-[#39ff14]/10 rounded-lg px-3 py-2 border border-white/10 hover:border-[#39ff14]/30">
          <ArrowLeft size={18} /> <span className="text-sm font-bold">BACK</span>
        </button>
        <h1 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: '"Fredoka One", sans-serif' }}>
          <Trophy size={20} className="text-[#39ff14]" /> RANKINGS
        </h1>
        <div className="w-20" />
      </div>

      {/* My Stats */}
      <div className="rounded-xl p-4 mb-4 border border-[#39ff14]/20"
           style={{ background: 'linear-gradient(135deg, rgba(57,255,20,0.08) 0%, rgba(10,10,15,0.9) 100%)' }}>
        <p className="text-white/40 text-xs mb-2">YOUR STATS</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><Star size={14} className="text-[#39ff14] mx-auto mb-1" /><span className="text-[#39ff14] font-bold">{totalStars}</span><p className="text-white/30 text-[10px]">Stars</p></div>
          <div><Trophy size={14} className="text-[#39ff14] mx-auto mb-1" /><span className="text-white font-bold">{completed}</span><p className="text-white/30 text-[10px]">Wins</p></div>
          <div><Crown size={14} className="text-[#39ff14] mx-auto mb-1" /><span className="text-white font-bold">{maxLevel}</span><p className="text-white/30 text-[10px]">Max Lv</p></div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-1.5">
        {finalList.map((entry) => (
          <div key={entry.rank} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all
            ${entry.isPlayer ? 'bg-[#39ff14]/15 border-[#39ff14]/40' : entry.rank <= 3 ? 'bg-[#39ff14]/10 border-[#39ff14]/20' : 'bg-white/[0.03] border-white/5'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${entry.rank === 1 ? 'bg-[#39ff14] text-black' : entry.rank === 2 ? 'bg-white/30 text-white' : entry.rank === 3 ? 'bg-orange-400 text-black' : 'bg-white/5 text-white/40'}`}>
              {entry.rank <= 3 ? (entry.rank === 1 ? <Crown size={14} /> : <Medal size={14} />) : entry.rank}
            </div>
            <div className="flex-1">
              <span className={`font-bold text-sm ${entry.isPlayer ? 'text-[#39ff14]' : entry.rank <= 3 ? 'text-white' : 'text-white/70'}`}>
                {entry.name}
                {entry.isPlayer && <span className="text-[9px] ml-1.5 px-1.5 py-0.5 rounded bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/30">YOU</span>}
              </span>
            </div>
            <div className="flex items-center gap-1"><Star size={12} className="text-[#39ff14] fill-[#39ff14]" /><span className="text-[#39ff14] font-bold text-xs">{entry.stars}</span></div>
            <span className="text-white/30 text-xs w-8 text-right">Lv.{entry.level}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-white/20 text-xs mt-4">Play more matches to climb the rankings</p>
    </div>
  );
}
