import { ArrowLeft, Star, Trophy, Zap, Shield, Wallet, Sparkles } from 'lucide-react';
import type { LevelProgress } from '@/types/game';

interface ProfileProps {
  levelProgress: Record<number, LevelProgress>;
  totalStars: number;
  isConnected: boolean;
  account: string | null;
  onBack: () => void;
  onConnectWallet: () => void;
  onCreateProfile: () => void;
}

const RANK_TIERS = [
  { name: 'Rookie', min: 0, color: '#888' },
  { name: 'Amateur', min: 5, color: '#39ff14' },
  { name: 'Pro', min: 12, color: '#00ccff' },
  { name: 'Elite', min: 20, color: '#ff44ff' },
  { name: 'Legend', min: 27, color: '#ffaa00' },
];

export default function Profile({ levelProgress, totalStars, isConnected, account, onBack, onConnectWallet, onCreateProfile }: ProfileProps) {
  const completed = Object.values(levelProgress).filter(p => p.completed).length;
  const maxLevel = completed > 0 ? Math.max(...Object.entries(levelProgress).filter(([,p]) => p.completed).map(([id]) => Number(id))) : 0;
  const tier = [...RANK_TIERS].reverse().find(t => totalStars >= t.min) || RANK_TIERS[0];

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1a0d 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/60 hover:text-[#39ff14] transition-colors bg-white/5 hover:bg-[#39ff14]/10 rounded-lg px-3 py-2 border border-white/10 hover:border-[#39ff14]/30">
          <ArrowLeft size={18} /> <span className="text-sm font-bold">BACK</span>
        </button>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: '"Fredoka One", sans-serif' }}>PROFILE</h1>
        <div className="w-20" />
      </div>

      {/* Profile Card */}
      <div className="max-w-sm mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-[#39ff14]/20 p-5 mb-4"
             style={{ background: 'linear-gradient(135deg, rgba(57,255,20,0.05) 0%, rgba(10,10,15,0.8) 100%)', boxShadow: '0 0 20px rgba(57,255,20,0.1)' }}>
          {/* Avatar */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#39ff14]/40 mb-2"
                 style={{ boxShadow: '0 0 20px rgba(57,255,20,0.2)' }}>
              <img src="/assets/player.png" alt="" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-white font-bold text-lg">{isConnected ? `${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Guest Player'}</h2>
            <div className="flex items-center gap-1 mt-1">
              <Shield size={12} style={{ color: tier.color }} />
              <span className="text-xs font-bold" style={{ color: tier.color }}>{tier.name}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-black/30 rounded-xl p-2">
              <Star className="w-4 h-4 text-[#39ff14] mx-auto mb-1" />
              <span className="text-[#39ff14] font-bold text-lg">{totalStars}</span>
              <p className="text-white/40 text-[10px]">Stars</p>
            </div>
            <div className="bg-black/30 rounded-xl p-2">
              <Trophy className="w-4 h-4 text-[#39ff14] mx-auto mb-1" />
              <span className="text-white font-bold text-lg">{completed}</span>
              <p className="text-white/40 text-[10px]">Wins</p>
            </div>
            <div className="bg-black/30 rounded-xl p-2">
              <Zap className="w-4 h-4 text-[#39ff14] mx-auto mb-1" />
              <span className="text-white font-bold text-lg">{maxLevel}</span>
              <p className="text-white/40 text-[10px]">Max Lv</p>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <h3 className="text-white/60 text-sm font-bold mb-2">Level Progress</h3>
        <div className="space-y-2 mb-6">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(lv => {
            const prog = levelProgress[lv];
            return (
              <div key={lv} className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                <span className="text-white/40 text-xs font-mono w-6">{String(lv).padStart(2, '0')}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: prog ? `${(prog.stars / 3) * 100}%` : '0%', background: prog ? '#39ff14' : '#333' }} />
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3].map(s => (
                    <Star key={s} size={10} className={s <= (prog?.stars || 0) ? 'text-[#39ff14] fill-[#39ff14]' : 'text-white/10'} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Profile Button */}
        {isConnected && (
          <button onClick={onCreateProfile} className="w-full h-11 rounded-xl bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14] hover:bg-[#39ff14]/20 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm mb-4 font-bold">
            <Sparkles size={16} /> CREATE / EDIT PROFILE
          </button>
        )}

        {/* Wallet */}
        {!isConnected && (
          <button onClick={onConnectWallet} className="w-full h-11 rounded-xl bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14] hover:bg-[#39ff14]/20 transition-all flex items-center justify-center gap-2 text-sm">
            <Wallet size={16} /> Connect Wallet to Save Progress
          </button>
        )}
      </div>
    </div>
  );
}
