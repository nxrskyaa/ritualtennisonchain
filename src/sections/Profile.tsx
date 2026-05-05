import { useState } from 'react';
import { ArrowLeft, Star, Trophy, Zap, Shield, Wallet, Sparkles, Edit3, Check, X, ExternalLink, Clock } from 'lucide-react';
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

function TxHistory() {
  const [history] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ritual_tx_history') || '[]');
    } catch {
      return [];
    }
  });

  if (history.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-[1px] bg-[#39ff14]/40" />
        <span className="text-[10px] tracking-[0.2em] text-[#39ff14]/60 font-bold uppercase">On-Chain History</span>
        <div className="flex-1 h-[1px] bg-white/5" />
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {history.map((tx: any, i: number) => {
          const date = new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          return (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#39ff14]/20 transition-all">
              <div className="w-7 h-7 rounded-full bg-[#39ff14]/10 flex items-center justify-center flex-shrink-0">
                <Clock size={12} className="text-[#39ff14]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white/70 text-xs font-bold">Lv.{tx.level}</span>
                  <span className="text-white/30 text-[10px]">{tx.playerScore}-{tx.aiScore}</span>
                  {tx.stars > 0 && <Star size={10} className="text-[#39ff14] fill-[#39ff14]" />}
                </div>
                <p className="text-white/20 text-[9px] font-mono mt-0.5">{date}</p>
              </div>
              <a
                href={`https://explorer.ritualfoundation.org/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/20 flex items-center justify-center hover:bg-[#39ff14]/20 transition-colors"
              >
                <ExternalLink size={12} className="text-[#39ff14]" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Profile({ levelProgress, totalStars, isConnected, account, onBack, onConnectWallet, onCreateProfile }: ProfileProps) {
  const completed = Object.values(levelProgress).filter(p => p.completed).length;
  const maxLevel = completed > 0 ? Math.max(...Object.entries(levelProgress).filter(([,p]) => p.completed).map(([id]) => Number(id))) : 0;
  const tier = [...RANK_TIERS].reverse().find(t => totalStars >= t.min) || RANK_TIERS[0];

  // Editable username
  const savedName = localStorage.getItem('ritual_username');
  const defaultName = savedName || (isConnected ? `${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Guest Player');
  const [username, setUsername] = useState(defaultName);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(username);

  const handleSaveName = () => {
    const trimmed = editValue.trim();
    if (trimmed.length > 0 && trimmed.length <= 20) {
      setUsername(trimmed);
      localStorage.setItem('ritual_username', trimmed);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(username);
    setIsEditing(false);
  };

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
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#39ff14]/60 mb-2 bg-[#39ff14]/20 flex items-center justify-center"
                 style={{ boxShadow: '0 0 20px rgba(57,255,20,0.3)' }}>
              <img src="/assets/player-new.png" alt="" className="w-full h-full object-cover" />
            </div>

            {/* Editable Name */}
            {isEditing ? (
              <div className="flex items-center gap-2 w-full max-w-[200px]">
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  maxLength={20}
                  className="flex-1 bg-black/40 border border-[#39ff14]/30 rounded-lg px-2 py-1 text-white text-sm text-center
                             focus:outline-none focus:border-[#39ff14]"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelEdit(); }}
                />
                <button onClick={handleSaveName} className="text-[#39ff14] hover:scale-110 transition-transform">
                  <Check size={16} />
                </button>
                <button onClick={handleCancelEdit} className="text-red-400 hover:scale-110 transition-transform">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-lg">{username}</h2>
                <button onClick={() => { setEditValue(username); setIsEditing(true); }}
                        className="text-white/30 hover:text-[#39ff14] transition-colors">
                  <Edit3 size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 mt-1">
              <Shield size={12} style={{ color: tier.color }} />
              <span className="text-xs font-bold" style={{ color: tier.color }}>{tier.name}</span>
            </div>
          </div>

          {/* Wallet Info */}
          {isConnected && (
            <div className="flex items-center justify-center gap-1.5 mb-3 py-1.5 rounded-lg bg-white/5">
              <Wallet size={12} className="text-[#39ff14]/60" />
              <span className="text-[10px] text-white/40 font-mono">{account?.slice(0, 8)}...{account?.slice(-6)}</span>
            </div>
          )}

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
              <div key={lv} className={`flex items-center gap-3 p-2 rounded-xl border ${prog?.completed ? 'border-[#39ff14]/20 bg-[#39ff14]/5' : 'border-white/5 bg-white/[0.02]'}`}>
                <span className="text-white/30 text-xs w-6">{lv}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#39ff14] to-[#7fff00] rounded-full transition-all" style={{ width: `${prog?.bestScore || 0}%` }} />
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3].map(s => <Star key={s} size={10} className={s <= (prog?.stars || 0) ? 'text-[#39ff14] fill-[#39ff14]' : 'text-white/10'} />)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Transaction History */}
        <TxHistory />

        {/* Connect Wallet */}
        {!isConnected ? (
          <button onClick={onConnectWallet}
                  className="w-full py-3 rounded-2xl border border-[#39ff14]/30 text-[#39ff14] font-bold flex items-center justify-center gap-2
                             hover:bg-[#39ff14]/10 transition-all text-sm">
            <Wallet size={16} /> Connect Wallet
          </button>
        ) : (
          <button onClick={onCreateProfile}
                  className="w-full py-3 rounded-2xl border border-white/10 text-white/60 font-bold flex items-center justify-center gap-2
                             hover:bg-white/5 transition-all text-sm">
            <Sparkles size={16} /> Update On-Chain Profile
          </button>
        )}
      </div>
    </div>
  );
}
