import { useEffect, useState } from 'react';
import { Hexagon } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  // Loading dots animation
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);

  // Progress bar
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [onComplete]);

  const clampedProgress = Math.min(100, progress);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
         style={{ background: 'linear-gradient(180deg, #050508 0%, #0a0f0a 50%, #050508 100%)' }}>

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#39ff14]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.3,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              boxShadow: '0 0 6px #39ff14',
            }}
          />
        ))}
      </div>

      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
           style={{
             backgroundImage: 'linear-gradient(rgba(57,255,20,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.3) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
           }} />

      {/* Hexagon ring animation */}
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
          <Hexagon size={120} className="text-[#39ff14]/10" strokeWidth={0.5} />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
          <Hexagon size={100} className="text-[#39ff14]/15" strokeWidth={0.5} />
        </div>

        {/* Logo */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <img src="/assets/logo-clean.png" alt="Ritual Tennis" className="w-20 h-20 object-contain animate-pulse"
               style={{ filter: 'drop-shadow(0 0 12px rgba(57,255,20,0.6))' }} />
        </div>
      </div>

      {/* Game Title */}
      <h1 className="text-3xl font-extrabold tracking-wider mb-1"
          style={{
            fontFamily: '"Fredoka One", sans-serif',
            color: '#39ff14',
            textShadow: '0 0 20px rgba(57,255,20,0.6), 0 0 40px rgba(57,255,20,0.2)',
          }}>
        RITUAL TENNIS
      </h1>
      <p className="text-[10px] tracking-[0.3em] text-white/30 mb-8 font-mono uppercase">
        Onchain Edition
      </p>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${clampedProgress}%`,
            background: 'linear-gradient(90deg, #39ff14, #7fff00)',
            boxShadow: '0 0 10px rgba(57,255,20,0.5)',
          }}
        />
      </div>

      {/* Loading text */}
      <p className="text-white/20 text-xs font-mono">
        LOADING{dots}
      </p>

      {/* Build on Ritual tag */}
      <div className="absolute bottom-8 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-[1px] bg-gradient-to-r from-transparent to-[#39ff14]/40" />
          <span className="text-[9px] tracking-[0.2em] text-[#39ff14]/40 font-mono uppercase"
                style={{ textShadow: '0 0 8px rgba(57,255,20,0.3)' }}>
            Build On Ritual
          </span>
          <div className="w-6 h-[1px] bg-gradient-to-l from-transparent to-[#39ff14]/40" />
        </div>
      </div>

      {/* CSS keyframes for floating particles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
