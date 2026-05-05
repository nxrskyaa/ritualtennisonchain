import { ArrowLeft, MoveHorizontal, Target, Star, Zap, Clock, Wallet, Sparkles } from 'lucide-react';

interface HowToPlayProps { onBack: () => void; }

export default function HowToPlay({ onBack }: HowToPlayProps) {
  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1a0d 100%)' }}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/60 hover:text-[#39ff14] transition-colors bg-white/5 hover:bg-[#39ff14]/10 rounded-lg px-3 py-2 border border-white/10 hover:border-[#39ff14]/30">
          <ArrowLeft size={18} /> <span className="text-sm font-bold">BACK</span>
        </button>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: '"Fredoka One", sans-serif' }}>HOW TO PLAY</h1>
        <div className="w-20" />
      </div>

      <div className="max-w-md mx-auto space-y-3 pb-8">
        {[
          { icon: <MoveHorizontal size={20} />, title: 'Controls', text: 'Use Arrow Keys or A/D to move left and right. On mobile, tap left or right side of the screen. Your character auto-hits the ball when it gets close!' },
          { icon: <Target size={20} />, title: 'Objective', text: 'Score points by making the ball land on your opponent\'s side. First to reach the target score wins the match!' },
          { icon: <Star size={20} />, title: 'Star Rating', text: '3-0 win = 3 stars, 3-1 = 2 stars, 3-2 = 1 star. Bonus star for rallies of 10+ hits!' },
          { icon: <Zap size={20} />, title: 'Rally System', text: 'Every successful hit increases ball speed! Long rallies create intense, fast-paced gameplay. Keep the rally going!' },
          { icon: <Clock size={20} />, title: 'Timed Matches', text: 'Some levels have a countdown timer. Score as many points as possible before time runs out!' },
          { icon: <Wallet size={20} />, title: 'Connect Wallet', text: 'Connect your wallet to submit scores on-chain to Ritual testnet. Compete on global leaderboards and earn NFT rewards!' },
          { icon: <Sparkles size={20} />, title: 'NFT Rewards', text: 'Win matches to earn NFT cards showing your performance. Collect cards from all 10 levels to become a true Ritual Tennis Legend!' },
        ].map((section, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 border border-[#39ff14]/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#39ff14]/10 flex items-center justify-center text-[#39ff14]">{section.icon}</div>
              <h3 className="text-white font-bold">{section.title}</h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">{section.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
