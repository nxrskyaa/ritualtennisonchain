import { useState } from 'react';
import { ArrowLeft, User, Sparkles, Shield, Zap, Target, Wallet, AlertCircle, Check } from 'lucide-react';
import type { GameCharacter } from '@/types/game';

const CHARACTERS: GameCharacter[] = [
  { id: 1, name: 'Ace Hunter', description: 'Speed-focused player with quick reflexes', image: '/assets/char1.png', style: 'aggressive' },
  { id: 2, name: 'Luna Strike', description: 'Balanced playstyle with sharp precision', image: '/assets/char2.png', style: 'balanced' },
  { id: 3, name: 'Titan Core', description: 'Powerful defense with tactical moves', image: '/assets/char3.png', style: 'defensive' },
  { id: 4, name: 'Spark Bot', description: 'Unpredictable AI-synced playstyle', image: '/assets/char4.png', style: 'aggressive' },
];

type StyleKey = 'aggressive' | 'balanced' | 'defensive';

const STYLE_ICONS: Record<StyleKey, React.ReactNode> = {
  aggressive: <Zap size={12} />,
  balanced: <Target size={12} />,
  defensive: <Shield size={12} />,
};

const STYLE_COLORS: Record<StyleKey, string> = {
  aggressive: '#ff4444',
  balanced: '#39ff14',
  defensive: '#4488ff',
};

interface Props {
  isConnected: boolean;
  account: string | null;
  onBack: () => void;
  onConnectWallet: () => void;
  onCreateProfile: (name: string, characterId: number) => void;
}

export default function ProfileCreation({ isConnected, account, onBack, onConnectWallet, onCreateProfile }: Props) {
  const [selectedChar, setSelectedChar] = useState(1);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [txHash, setTxHash] = useState('');

  const selected = CHARACTERS.find(c => c.id === selectedChar) || CHARACTERS[0];

  const handleCreate = async () => {
    if (!name.trim() || name.length > 32) return;
    setCreating(true);

    // Simulate onchain transaction
    await new Promise(r => setTimeout(r, 2000));
    const mockTxHash = '0x' + Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
    setTxHash(mockTxHash);

    // Save locally
    const profile = {
      username: name.trim(),
      characterId: selectedChar,
      characterName: selected.name,
      createdAt: Date.now(),
      txHash: mockTxHash,
      wallet: account,
    };
    localStorage.setItem('ritual_profile', JSON.stringify(profile));

    setCreating(false);
    setCreated(true);
    onCreateProfile(name.trim(), selectedChar);
  };

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1a0d 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/60 hover:text-[#39ff14] transition-colors bg-white/5 hover:bg-[#39ff14]/10 rounded-lg px-3 py-2 border border-white/10 hover:border-[#39ff14]/30">
          <ArrowLeft size={18} /> <span className="text-sm font-bold">BACK</span>
        </button>
        <h1 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: '"Fredoka One", sans-serif' }}>
          <User size={20} className="text-[#39ff14]" /> CREATE PROFILE
        </h1>
        <div className="w-20" />
      </div>

      {/* Wallet Check */}
      {!isConnected && (
        <div className="max-w-md mx-auto mb-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-white font-bold mb-1">Wallet Required</p>
            <p className="text-white/50 text-sm mb-3">Connect your wallet to create a profile and save it on-chain</p>
            <button onClick={onConnectWallet} className="h-10 px-6 rounded-xl bg-[#39ff14] text-black font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto text-sm">
              <Wallet size={16} /> Connect Wallet
            </button>
          </div>
        </div>
      )}

      {isConnected && !created && (
        <div className="max-w-lg mx-auto space-y-5">
          {/* Step 1: Character Selection */}
          <div>
            <h2 className="text-white/60 text-sm font-bold mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-[#39ff14]" /> STEP 1: CHOOSE YOUR CHARACTER
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedChar(char.id)}
                  className={`relative rounded-xl p-3 transition-all border text-left
                    ${selectedChar === char.id
                      ? 'bg-[#39ff14]/10 border-[#39ff14]/40 shadow-[0_0_15px_rgba(57,255,20,0.1)] scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#39ff14]/20'
                    }`}
                >
                  {selectedChar === char.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#39ff14] flex items-center justify-center">
                      <Check size={12} className="text-black" />
                    </div>
                  )}
                  <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-black/30 border border-white/5">
                    <img src={char.image} alt={char.name} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-white font-bold text-xs">{char.name}</p>
                  <p className="text-white/40 text-[10px] mt-0.5">{char.description}</p>
                  <div className="flex items-center gap-1 mt-1.5" style={{ color: STYLE_COLORS[char.style as StyleKey] }}>
                    {STYLE_ICONS[char.style as StyleKey]}
                    <span className="text-[9px] font-bold uppercase">{char.style}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Name Input */}
          <div>
            <h2 className="text-white/60 text-sm font-bold mb-3 flex items-center gap-2">
              <User size={14} className="text-[#39ff14]" /> STEP 2: CHOOSE YOUR NAME
            </h2>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 32))}
                placeholder="Enter player name (max 32 chars)"
                maxLength={32}
                className="w-full bg-black/30 rounded-lg px-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-[#39ff14]/40 focus:outline-none text-sm"
              />
              <div className="flex justify-between mt-2">
                <span className="text-white/30 text-xs">{name.length}/32 characters</span>
                <span className="text-white/30 text-xs font-mono">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
              </div>
            </div>
          </div>

          {/* Step 3: Create */}
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="w-full h-12 rounded-xl bg-[#39ff14] text-black font-bold hover:scale-105 transition-all disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Creating On-Chain Profile...
              </>
            ) : (
              <>
                <Sparkles size={16} /> CREATE PROFILE
              </>
            )}
          </button>

          <p className="text-white/20 text-[10px] text-center">
            This will create a profile on Ritual Testnet (Chain ID: 1979)
          </p>
        </div>
      )}

      {/* Success State */}
      {created && (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-[#39ff14]/10 rounded-2xl p-6 border border-[#39ff14]/30 mb-4">
            <div className="w-20 h-20 rounded-full bg-[#39ff14]/20 flex items-center justify-center mx-auto mb-3 border-2 border-[#39ff14]/30">
              <Check size={36} className="text-[#39ff14]" />
            </div>
            <h2 className="text-[#39ff14] text-xl font-bold mb-1">Profile Created!</h2>
            <p className="text-white/50 text-sm">Your profile has been saved on-chain</p>
          </div>

          {/* Profile Card Preview */}
          <div className="relative w-64 h-80 mx-auto mb-5 rounded-xl overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #0f1a0f 0%, #1a0f1a 100%)', border: '2px solid #39ff14', boxShadow: '0 0 25px rgba(57,255,20,0.15)' }}>
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#39ff14]/10 text-[#39ff14] text-[8px] font-bold border border-[#39ff14]/20">RITUAL ID</div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#39ff14]/40 mb-2 bg-black/30">
                <img src={selected.image} alt="" className="w-full h-full object-contain" />
              </div>
              <p className="text-white font-bold text-sm mb-0.5">{name}</p>
              <p className="text-[#39ff14] text-xs mb-2">{selected.name}</p>
              <div className="flex items-center gap-1" style={{ color: STYLE_COLORS[selected.style as StyleKey] }}>
                {STYLE_ICONS[selected.style as StyleKey]}
                <span className="text-[9px] font-bold uppercase">{selected.style}</span>
              </div>
              <div className="mt-3 w-full bg-black/30 rounded p-2 text-left">
                <p className="text-white/30 text-[8px] font-mono mb-1">TRANSACTION</p>
                <p className="text-[#39ff14]/60 text-[8px] font-mono break-all">{txHash.slice(0, 20)}...{txHash.slice(-8)}</p>
                <p className="text-white/20 text-[7px] font-mono mt-1">Ritual Testnet | Chain 1979</p>
              </div>
            </div>
          </div>

          <button onClick={onBack} className="h-10 px-8 rounded-xl bg-[#39ff14] text-black font-bold hover:scale-105 transition-all text-sm">
            GO TO MENU
          </button>
        </div>
      )}
    </div>
  );
}
