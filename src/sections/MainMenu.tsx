import { useEffect, useRef } from 'react';
import { Trophy, User, HelpCircle, Wallet, LogOut, Sparkles, Zap, Info } from 'lucide-react';

interface MainMenuProps {
  totalStars: number;
  isConnected: boolean;
  account: string | null;
  onPlay: () => void;
  onLeaderboard: () => void;
  onProfile: () => void;
  onHowToPlay: () => void;
  onAbout: () => void;
  onConnectWallet: () => void;
  onDisconnect: () => void;
}

export default function MainMenu({ totalStars, isConnected, account, onPlay, onLeaderboard, onProfile, onHowToPlay, onAbout, onConnectWallet, onDisconnect }: MainMenuProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    // Mouse parallax
    let mouseX = w / 2, mouseY = h / 2;
    const handleMouse = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('mousemove', handleMouse);

    // Floating particles with constellation lines
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        size: 1 + Math.random() * 2.5, alpha: 0.15 + Math.random() * 0.5,
        speed: 0.3 + Math.random() * 0.5,
      });
    }

    // Orbital rings
    const rings = [
      { cx: 0.5, cy: 0.4, radius: 120, rot: 0, speed: 0.003, dots: 6 },
      { cx: 0.5, cy: 0.4, radius: 180, rot: Math.PI, speed: -0.002, dots: 8 },
      { cx: 0.3, cy: 0.7, radius: 60, rot: 0, speed: 0.005, dots: 4 },
      { cx: 0.7, cy: 0.2, radius: 50, rot: Math.PI / 2, speed: -0.004, dots: 3 },
    ];

    // Grid lines
    let gridOffset = 0;

    // Hexagons
    const hexagons: { x: number; y: number; size: number; rot: number; speed: number }[] = [];
    for (let i = 0; i < 6; i++) {
      hexagons.push({ x: Math.random() * w, y: Math.random() * h, size: 12 + Math.random() * 20, rot: Math.random() * Math.PI * 2, speed: 0.001 + Math.random() * 0.002 });
    }

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = (mouseX - w / 2) * 0.02;
      const my = (mouseY - h / 2) * 0.02;

      // Animated grid background
      gridOffset += 0.3;
      ctx.strokeStyle = 'rgba(57,255,20,0.03)';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = -gridSize + (gridOffset % gridSize); x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = -gridSize + (gridOffset % gridSize); y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Hexagons
      hexagons.forEach(hex => {
        hex.rot += hex.speed;
        hex.y -= 0.12;
        if (hex.y < -60) { hex.y = h + 60; hex.x = Math.random() * w; }
        ctx.save();
        ctx.translate(hex.x + mx * 0.5, hex.y + my * 0.5);
        ctx.rotate(hex.rot);
        ctx.strokeStyle = `rgba(57,255,20,${0.04 + Math.sin(hex.rot * 2) * 0.03})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          i === 0 ? ctx.moveTo(hex.size * Math.cos(angle), hex.size * Math.sin(angle))
                  : ctx.lineTo(hex.size * Math.cos(angle), hex.size * Math.sin(angle));
        }
        ctx.closePath(); ctx.stroke(); ctx.restore();
      });

      // Orbital rings
      rings.forEach(ring => {
        ring.rot += ring.speed;
        const cx = ring.cx * w + mx;
        const cy = ring.cy * h + my;
        for (let i = 0; i < ring.dots; i++) {
          const angle = ring.rot + (Math.PI * 2 / ring.dots) * i;
          const px = cx + Math.cos(angle) * ring.radius;
          const py = cy + Math.sin(angle) * ring.radius * 0.4;
          ctx.fillStyle = `rgba(57,255,20,${0.2 + Math.sin(angle * 3 + ring.rot * 5) * 0.15})`;
          ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
        }
        // Ring line
        ctx.strokeStyle = `rgba(57,255,20,0.04)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, ring.radius, ring.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Particles with constellation lines
      particles.forEach((p, i) => {
        p.x += p.vx * p.speed;
        p.y += p.vy * p.speed;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(57,255,20,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }

        ctx.fillStyle = `rgba(57,255,20,${p.alpha})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });

      // Floating particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        ctx.fillStyle = `rgba(57,255,20,${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      frame = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', handleResize); window.removeEventListener('mousemove', handleMouse); };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden"
         style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1a0d 50%, #0a0a0f 100%)' }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Wallet */}
      <div className="absolute top-4 right-4 z-20">
        {isConnected ? (
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-[#39ff14]/20">
            <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" />
            <span className="text-[#39ff14] text-sm font-mono">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
            <button onClick={onDisconnect} className="ml-1 text-white/40 hover:text-white transition-colors"><LogOut size={14} /></button>
          </div>
        ) : (
          <button onClick={onConnectWallet} className="flex items-center gap-2 bg-[#39ff14]/10 backdrop-blur-sm rounded-full px-4 py-2 border border-[#39ff14]/30 text-[#39ff14] hover:bg-[#39ff14]/20 transition-all">
            <Wallet size={14} /> Connect
          </button>
        )}
      </div>

      {/* Logo */}
      <div className="relative z-10 text-center mb-6">
        <div className="relative mx-auto mb-4" style={{ width: '160px', height: '160px' }}>
          {/* Rotating ring behind logo */}
          <div className="absolute inset-0 rounded-full border border-[#39ff14]/20 animate-[spin_12s_linear_infinite]" style={{ boxShadow: '0 0 20px rgba(57,255,20,0.1)' }} />
          <div className="absolute inset-2 rounded-full border border-dashed border-[#39ff14]/10 animate-[spin_20s_linear_infinite_reverse]" />
          {/* Pulsing glow */}
          <div className="absolute inset-4 rounded-full bg-[#39ff14]/5 animate-pulse" style={{ boxShadow: '0 0 40px rgba(57,255,20,0.15)' }} />
          {/* Logo */}
          <img src="/assets/logo-clean.png" alt="Ritual Tennis" className="absolute inset-0 w-full h-full object-contain z-10 animate-[float_4s_ease-in-out_infinite]" style={{ filter: 'drop-shadow(0 0 30px rgba(57,255,20,0.4)) drop-shadow(0 0 60px rgba(57,255,20,0.15))' }} />
          {/* Corner accents */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[#39ff14]/30" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-[#39ff14]/30" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-[#39ff14]/30" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-[#39ff14]/30" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none" style={{ fontFamily: '"Fredoka One", sans-serif', color: '#39ff14', textShadow: '0 0 30px rgba(57,255,20,0.5), 0 0 60px rgba(57,255,20,0.2)' }}>
          RITUAL
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-widest mt-0.5" style={{ textShadow: '0 0 15px rgba(57,255,20,0.3)' }}>
          TENNIS
        </h2>
        <p className="text-[#39ff14]/50 text-xs tracking-[0.3em] mt-1 font-mono">ONCHAIN</p>
        {totalStars > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <Sparkles className="w-4 h-4 text-[#39ff14]" />
            <span className="text-[#39ff14] font-bold">{totalStars} Stars</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="relative z-10 w-full max-w-xs space-y-3">
        <button onClick={onPlay} className="w-full h-14 text-lg font-bold rounded-xl bg-[#39ff14] text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:shadow-[0_0_30px_rgba(57,255,20,0.6)] flex items-center justify-center gap-2">
          <Zap size={20} /> PLAY
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onLeaderboard} className="h-12 rounded-xl bg-white/5 border border-[#39ff14]/20 text-white hover:bg-[#39ff14]/10 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
            <Trophy size={16} className="text-[#39ff14]" /> Rank
          </button>
          <button onClick={onProfile} className="h-12 rounded-xl bg-white/5 border border-[#39ff14]/20 text-white hover:bg-[#39ff14]/10 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
            <User size={16} className="text-[#39ff14]" /> Profile
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onHowToPlay} className="h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
            <HelpCircle size={14} /> How to Play
          </button>
          <button onClick={onAbout} className="h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-[#39ff14]/10 hover:border-[#39ff14]/20 hover:text-[#39ff14] hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
            <Info size={14} /> About
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-white/20 text-xs font-mono z-10">
        <p>Powered by Ritual Chain | Chain ID: 1979</p>
      </div>
    </div>
  );
}
