import { useState } from 'react';
import { X, Wallet, AlertCircle, ExternalLink, Check } from 'lucide-react';

interface WalletConnectProps {
  onConnect: (walletType: string) => void;
  onClose: () => void;
  isConnecting: boolean;
  isOnRitual: boolean;
  chainId: number | null;
  error: string | null;
}

const WALLETS = [
  { id: 'metamask', name: 'MetaMask', icon: '/assets/logo.png', desc: 'Most popular wallet' },
  { id: 'okx', name: 'OKX Wallet', icon: '/assets/logo.png', desc: 'Multi-chain support' },
  { id: 'rabby', name: 'Rabby', icon: '/assets/logo.png', desc: 'Security-focused' },
  { id: 'phantom', name: 'Phantom EVM', icon: '/assets/logo.png', desc: 'Solana + EVM' },
];

export default function WalletConnect({ onConnect, onClose, isConnecting, isOnRitual, chainId, error }: WalletConnectProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'guide'>('select');

  const handleConnect = () => {
    if (selectedWallet) {
      onConnect(selectedWallet);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl p-5 border border-[#39ff14]/20 max-h-[90vh] overflow-y-auto"
           style={{ background: 'linear-gradient(180deg, #0f1a0f 0%, #0a0a0f 100%)', boxShadow: '0 0 30px rgba(57,255,20,0.1)' }}>

        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white z-10"><X size={18} /></button>

        {step === 'select' ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-xl bg-[#39ff14]/10 flex items-center justify-center border border-[#39ff14]/20">
                <Wallet size={28} className="text-[#39ff14]" />
              </div>
            </div>

            <h2 className="text-white text-lg font-bold text-center mb-1">Connect Wallet</h2>
            <p className="text-white/50 text-xs text-center mb-4">Select wallet to connect to Ritual Testnet</p>

            {/* Network Badge */}
            <div className={`flex items-center justify-center gap-2 mb-4 py-1.5 px-3 rounded-full border ${isOnRitual ? 'bg-[#39ff14]/10 border-[#39ff14]/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isOnRitual ? 'bg-[#39ff14]' : 'bg-yellow-400'}`} />
              <span className={`text-xs font-bold ${isOnRitual ? 'text-[#39ff14]' : 'text-yellow-400'}`}>
                {isOnRitual ? 'Ritual Chain Connected' : chainId ? `Chain ${chainId} - Will Switch` : 'Ritual Chain (1979)'}
              </span>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 mb-3 flex items-start gap-2">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-400 text-xs">{error}</span>
              </div>
            )}

            {/* Wallet List */}
            <div className="space-y-2 mb-4">
              {WALLETS.map((w) => (
                <button key={w.id}
                  onClick={() => setSelectedWallet(w.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                    ${selectedWallet === w.id
                      ? 'bg-[#39ff14]/10 border-[#39ff14]/40 shadow-[0_0_10px_rgba(57,255,20,0.1)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}>
                  <div className="w-9 h-9 rounded-lg bg-black/50 flex items-center justify-center border border-[#39ff14]/20">
                    <Wallet size={18} className="text-[#39ff14]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{w.name}</p>
                    <p className="text-white/40 text-[10px]">{w.desc}</p>
                  </div>
                  {selectedWallet === w.id && <Check size={16} className="text-[#39ff14]" />}
                </button>
              ))}
            </div>

            <button onClick={handleConnect} disabled={!selectedWallet || isConnecting}
              className="w-full h-11 rounded-xl bg-[#39ff14] text-black font-bold hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)]">
              {isConnecting ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Connect'}
            </button>

            <button onClick={() => setStep('guide')} className="w-full mt-2 text-[#39ff14]/50 text-xs hover:text-[#39ff14] transition-colors flex items-center justify-center gap-1">
              <ExternalLink size={10} /> How to setup wallet for Ritual
            </button>
          </>
        ) : (
          <>
            <h2 className="text-white text-lg font-bold text-center mb-3">Setup Guide</h2>

            <div className="space-y-3 text-xs">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-[#39ff14] font-bold mb-1">Step 1: Install Wallet</p>
                <p className="text-white/60">Install MetaMask, OKX, Rabby, or Phantom EVM wallet extension in your browser.</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-[#39ff14] font-bold mb-1">Step 2: Add Ritual Testnet</p>
                <p className="text-white/60">Network will be added automatically on connect. Or add manually:</p>
                <div className="mt-1.5 bg-black/30 rounded p-2 font-mono text-[10px] text-white/70 space-y-0.5">
                  <p>Network: Ritual Testnet</p>
                  <p>RPC: https://rpc.ritualfoundation.org</p>
                  <p>Chain ID: 1979</p>
                  <p>Symbol: RITUAL</p>
                  <p>Explorer: explorer.ritualfoundation.org</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-[#39ff14] font-bold mb-1">Step 3: Get Testnet Tokens</p>
                <a href="https://faucet.ritualfoundation.org" target="_blank" rel="noopener noreferrer" className="text-[#39ff14] hover:underline flex items-center gap-1">
                  <ExternalLink size={10} /> Visit Ritual Faucet
                </a>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-[#39ff14]/20">
                <p className="text-[#39ff14] font-bold mb-1">Step 4: Deploy Smart Contract (Optional)</p>
                <p className="text-white/60">Contract address is currently set to placeholder. To enable on-chain features:</p>
                <ol className="mt-1 text-white/50 list-decimal list-inside space-y-0.5">
                  <li>Deploy ScoreContract.sol to Ritual Testnet</li>
                  <li>Copy deployed contract address</li>
                  <li>Update in src/config/ritual.ts</li>
                </ol>
              </div>
            </div>

            <button onClick={() => setStep('select')} className="w-full mt-4 h-10 rounded-xl bg-white/5 border border-[#39ff14]/20 text-white hover:bg-[#39ff14]/10 transition-all text-sm">
              Back to Wallet Select
            </button>
          </>
        )}

        <div className="mt-3 text-center">
          <p className="text-white/20 text-[10px]">Powered by Ritual Chain | Testnet</p>
        </div>
      </div>
    </div>
  );
}
