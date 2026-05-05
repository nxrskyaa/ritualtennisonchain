import { useEffect, useRef, useState, useCallback } from 'react';
import { Pause, Play, RotateCcw, Home, Trophy, Zap } from 'lucide-react';
import type { LevelConfig, AIPersonality } from '@/types/game';
import { TennisEngine } from '@/game/engine';
import type { GameEvent } from '@/game/engine';

interface Props {
  level: LevelConfig;
  aiPersonality: AIPersonality;
  playerChar: string;
  onMatchEnd: (winner: 'player' | 'ai', playerScore: number, aiScore: number, maxRally: number, ai: AIPersonality) => void;
  onBackToMenu: () => void;
  onRestart: () => void;
}

export default function GameScreen({ level, aiPersonality, onMatchEnd, onBackToMenu, onRestart }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TennisEngine | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [rallyText, setRallyText] = useState('');
  const [matchOver, setMatchOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [scores, setScores] = useState({ p: 0, a: 0, rally: 0 });

  const W = 400, H = 700;

  const onEvent = useCallback((e: GameEvent) => {
    switch (e.type) {
      case 'rally_milestone': setRallyText(`${e.count} HIT RALLY!`); setTimeout(() => setRallyText(''), 1500); break;
      case 'match_end':
        setMatchOver(true);
        setWinner(e.winner);
        setScores({ p: e.playerScore, a: e.aiScore, rally: engineRef.current?.getState().maxRally || 0 });
        onMatchEnd(e.winner, e.playerScore, e.aiScore, engineRef.current?.getState().maxRally || 0, aiPersonality);
        break;
    }
  }, [onMatchEnd, aiPersonality]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W; canvas.height = H;
    const engine = new TennisEngine(canvas, level, aiPersonality);
    engineRef.current = engine;
    engine.addEventListener(onEvent);
    const t = setTimeout(() => engine.start(), 200);
    return () => { clearTimeout(t); engine.destroy(); engine.removeEventListener(onEvent); };
  }, [level, aiPersonality, onEvent]);

  const pause = () => { engineRef.current?.pause(); setIsPaused(true); };
  const resume = () => { engineRef.current?.resume(); setIsPaused(false); };
  const restart = () => { setMatchOver(false); setWinner(null); onRestart(); };
  const quit = () => { engineRef.current?.destroy(); onBackToMenu(); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2" style={{ background: '#0a0a0f' }}>
      {/* Top bar */}
      <div className="w-full max-w-[400px] flex items-center justify-between mb-1 px-2">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#39ff14]" /><span className="text-[#39ff14] font-bold text-[10px]">YOU</span></div>
        <span className="text-white/25 text-[10px] font-mono">Lv.{level.id}</span>
        <div className="flex items-center gap-1"><span className="text-red-400 font-bold text-[10px]">{aiPersonality.name}</span><div className="w-2 h-2 rounded-full bg-red-400" /></div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-[#39ff14]/15" style={{ boxShadow: '0 0 20px rgba(57,255,20,0.06)' }}>
        <canvas ref={canvasRef} className="block max-w-full" style={{ width: '100%', maxWidth: '400px', touchAction: 'none' }} />

        <button onClick={pause} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white/50 hover:text-white"><Pause size={14} /></button>

        {rallyText && <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-[#39ff14] font-extrabold text-lg animate-bounce" style={{ textShadow: '0 0 15px rgba(57,255,20,0.8)' }}>{rallyText}</div>}

        {/* Pause Overlay */}
        {isPaused && !matchOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-20">
            <h2 className="text-[#39ff14] text-2xl font-bold" style={{ textShadow: '0 0 15px rgba(57,255,20,0.5)' }}>PAUSED</h2>
            <button onClick={resume} className="w-36 h-10 rounded-lg bg-[#39ff14] text-black font-bold hover:scale-105 flex items-center justify-center gap-1 text-sm"><Play size={15} /> RESUME</button>
            <button onClick={restart} className="w-36 h-9 rounded-lg bg-white/5 border border-[#39ff14]/20 text-white hover:bg-[#39ff14]/10 hover:scale-105 flex items-center justify-center gap-1 text-xs"><RotateCcw size={13} /> RESTART</button>
            <button onClick={quit} className="w-36 h-9 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:scale-105 flex items-center justify-center gap-1 text-xs"><Home size={13} /> QUIT</button>
          </div>
        )}

        {/* MATCH OVER Overlay */}
        {matchOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3 z-30 animate-in fade-in">
            {winner === 'player' ? (
              <>
                <Trophy className="w-14 h-14 text-[#39ff14] mb-1" style={{ filter: 'drop-shadow(0 0 12px rgba(57,255,20,0.5))' }} />
                <h2 className="text-[#39ff14] text-3xl font-extrabold" style={{ fontFamily: '"Fredoka One",sans-serif', textShadow: '0 0 20px rgba(57,255,20,0.5)' }}>VICTORY</h2>
              </>
            ) : (
              <>
                <Zap className="w-14 h-14 text-red-400 mb-1" />
                <h2 className="text-red-400 text-3xl font-extrabold" style={{ fontFamily: '"Fredoka One",sans-serif' }}>DEFEAT</h2>
              </>
            )}
            <div className="text-white text-3xl font-bold font-mono my-1">{scores.p} <span className="text-white/30">-</span> {scores.a}</div>
            <p className="text-white/40 text-xs">Max Rally: {scores.rally} hits</p>

            <div className="flex flex-col gap-2 mt-2 w-40">
              <button onClick={restart} className="h-10 rounded-xl bg-[#39ff14] text-black font-bold hover:scale-105 transition-all flex items-center justify-center gap-1 text-sm shadow-[0_0_15px_rgba(57,255,20,0.3)]"><RotateCcw size={14} /> REMATCH</button>
              <button onClick={quit} className="h-9 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:scale-105 transition-all flex items-center justify-center gap-1 text-xs"><Home size={13} /> MAIN MENU</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-white/20 text-[9px] mt-1.5 text-center">Move to position &bull; Auto-hit when close &bull; Tap to serve</p>
    </div>
  );
}
