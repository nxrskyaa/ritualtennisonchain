import { ArrowLeft, ExternalLink, Hexagon } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const CREATORS = [
  {
    name: 'Nxrskyaa',
    role: 'Creator Game',
    xUrl: 'https://x.com/nxrskyaa',
  },
];

const SPECIAL_CREDITS = [
  {
    name: 'Evo Yudha Samael',
    xUrl: 'https://x.com/Evoyudhasamael',
  },
  {
    name: 'John',
    xUrl: 'https://x.com/johntolxbt',
  },
];

export default function About({ onBack }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col"
         style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d140d 50%, #0a0a0f 100%)' }}>

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-[#39ff14]"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              opacity: 0.15 + Math.random() * 0.2,
              animation: `floatAbout ${4 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              boxShadow: '0 0 4px #39ff14',
            }}
          />
        ))}
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{
               backgroundImage: 'linear-gradient(rgba(57,255,20,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.5) 1px, transparent 1px)',
               backgroundSize: '50px 50px',
             }} />
      </div>

      {/* Header */}
      <div className="relative flex items-center gap-3 p-4">
        <button onClick={onBack}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center
                           text-white/50 hover:text-[#39ff14] hover:border-[#39ff14]/30 transition-all">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-lg font-bold text-white/80 tracking-wide">About</h2>
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center px-6 py-4 overflow-y-auto">

        {/* Logo */}
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
            <Hexagon size={80} className="text-[#39ff14]/10" strokeWidth={0.5} />
          </div>
          <img src="/assets/logo-clean.png" alt="" className="w-16 h-16 object-contain absolute inset-2"
               style={{ filter: 'drop-shadow(0 0 10px rgba(57,255,20,0.5))' }} />
        </div>

        <h1 className="text-2xl font-extrabold mb-0.5"
            style={{
              fontFamily: '"Fredoka One", sans-serif',
              color: '#39ff14',
              textShadow: '0 0 15px rgba(57,255,20,0.5)',
            }}>
          RITUAL TENNIS
        </h1>
        <p className="text-[10px] tracking-[0.25em] text-white/30 mb-6 font-mono uppercase">
          Onchain Edition v1.0
        </p>

        {/* Creator Section */}
        <div className="w-full max-w-xs mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-[1px] bg-[#39ff14]/40" />
            <span className="text-[10px] tracking-[0.2em] text-[#39ff14]/60 font-bold uppercase">Creator</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>

          {CREATORS.map((c) => (
            <a key={c.name}
               href={c.xUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5
                          hover:border-[#39ff14]/20 hover:bg-[#39ff14]/[0.03] transition-all group">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white/80 group-hover:text-[#39ff14] transition-colors">{c.name}</span>
                <span className="text-[10px] text-white/30">{c.role}</span>
              </div>
              <ExternalLink size={14} className="text-white/20 group-hover:text-[#39ff14] transition-colors" />
            </a>
          ))}
        </div>

        {/* Special Credits Section */}
        <div className="w-full max-w-xs mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-[1px] bg-[#39ff14]/40" />
            <span className="text-[10px] tracking-[0.2em] text-[#39ff14]/60 font-bold uppercase">Special Credits</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>

          <div className="space-y-2">
            {SPECIAL_CREDITS.map((c) => (
              <a key={c.name}
                 href={c.xUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5
                            hover:border-[#39ff14]/20 hover:bg-[#39ff14]/[0.03] transition-all group">
                <span className="text-sm font-bold text-white/70 group-hover:text-[#39ff14] transition-colors">{c.name}</span>
                <ExternalLink size={14} className="text-white/20 group-hover:text-[#39ff14] transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="w-full max-w-xs mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-[1px] bg-[#39ff14]/40" />
            <span className="text-[10px] tracking-[0.2em] text-[#39ff14]/60 font-bold uppercase">Tech Stack</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Viem', 'Tailwind CSS', 'Ritual Chain'].map((tech) => (
              <span key={tech} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/40">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Build On Ritual - Neon Effect */}
        <div className="flex flex-col items-center gap-2 mb-4 mt-4">
          <div className="relative">
            {/* Glow layers */}
            <div className="absolute inset-0 text-xs tracking-[0.3em] font-bold text-[#39ff14]/10 blur-sm"
                 style={{ textShadow: '0 0 30px rgba(57,255,20,0.8), 0 0 60px rgba(57,255,20,0.4)' }}>
              BUILD ON RITUAL
            </div>
            <div className="absolute inset-0 text-xs tracking-[0.3em] font-bold text-[#39ff14]/30 blur-[1px]"
                 style={{ textShadow: '0 0 15px rgba(57,255,20,0.6)' }}>
              BUILD ON RITUAL
            </div>
            {/* Main text */}
            <span className="relative text-xs tracking-[0.3em] font-bold text-[#39ff14]"
                  style={{
                    textShadow: '0 0 10px rgba(57,255,20,0.8), 0 0 20px rgba(57,255,20,0.4), 0 0 40px rgba(57,255,20,0.2)',
                    animation: 'pulseGlow 2s ease-in-out infinite',
                  }}>
              BUILD ON RITUAL
            </span>
          </div>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#39ff14]/30 to-transparent" />
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes floatAbout {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
