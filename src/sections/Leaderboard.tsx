import { ArrowLeft, Star, Trophy, Crown, Medal } from 'lucide-react';
import type { LevelProgress } from '@/types/game';

interface LeaderboardProps {
  levelProgress: Record<number, LevelProgress>;
  onBack: () => void;
}

const MOCK = [
  { rank: 1, name: 'AceMaster', stars: 30, wins: 45, level: 10 },
  { rank: 2, name: 'PingPong99', stars: 28, wins: 38, level: 10 },
  { rank: 3, name: 'SpinKing', stars: 27, wins: 35, level: 9 },
  { rank: 4, name: 'RallyPro', stars: 24, wins: 30, level: 9 },
  { rank: 5, name: 'SmashBot', stars: 22, wins: 27, level: 8 },
  { rank: 6, name: 'HexPlayer', stars: 20, wins: 24, level: 8 },
  { rank: 7, name: 'NeonAce', stars: 18, wins: 21, level: 7 },
  { rank: 8, name: 'ClawStar', stars: 15, wins: 18, level: 7 },
  { rank: 9, name: 'VoltRush', stars: 12, wins: 14, level: 6 },
  { rank: 10, name: 'ByteBall', stars: 10, wins: 12, level: 5 },
];

export default function Leaderboard({ levelProgress, onBack }: LeaderboardProps) {
  const totalStars = Object.values(levelProgress).reduce((sum, p) => sum + p.stars, 0);
  const completed = Object.values(levelProgress).filter(p => p.completed).length;

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
          <div><Crown size={14} className="text-[#39ff14] mx-auto mb-1" /><span className="text-white font-bold">{completed > 0 ? Math.max(...Object.entries(levelProgress).filter(([,p]) => p.completed).map(([id]) => Number(id))) : 0}</span><p className="text-white/30 text-[10px]">Max Lv</p></div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {MOCK.map((entry) => (
          <div key={entry.rank} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all
            ${entry.rank <= 3 ? 'bg-[#39ff14]/10 border-[#39ff14]/20' : 'bg-white/[0.03] border-white/5'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${entry.rank === 1 ? 'bg-[#39ff14] text-black' : entry.rank === 2 ? 'bg-white/30 text-white' : entry.rank === 3 ? 'bg-orange-400 text-black' : 'bg-white/5 text-white/40'}`}>
              {entry.rank <= 3 ? (entry.rank === 1 ? <Crown size={14} /> : <Medal size={14} />) : entry.rank}
            </div>
            <div className="flex-1"><span className={`font-bold text-sm ${entry.rank <= 3 ? 'text-white' : 'text-white/70'}`}>{entry.name}</span></div>
            <div className="flex items-center gap-1"><Star size={12} className="text-[#39ff14] fill-[#39ff14]" /><span className="text-[#39ff14] font-bold text-xs">{entry.stars}</span></div>
            <span className="text-white/30 text-xs w-8 text-right">Lv.{entry.level}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-white/20 text-xs mt-4">On-chain leaderboard coming soon</p>
    </div>
  );
}
