import type { LevelConfig, AIPersonality } from '@/types/game';

const C = {
  BG: '#0a0a0f',
  COURT_BG: '#0d1f0d',
  COURT_IN: '#112611',
  LINE: 'rgba(255,255,255,0.7)',
  NET: '#ff3333',
  NET_MESH: 'rgba(255,51,51,0.3)',
  PLAYER: '#39ff14',
  AI: '#ff4444',
  BALL: '#ffff00',
  SHADOW: 'rgba(0,0,0,0.3)',
  WHITE: '#ffffff',
};

export interface GameState {
  playerScore: number;
  aiScore: number;
  rallyCount: number;
  maxRally: number;
  timeRemaining: number;
  phase: 'serve' | 'play' | 'point' | 'matchover';
  server: 'player' | 'ai';
  message: string;
  msgTimer: number;
  isPlaying: boolean;
  playerGames: number;
  aiGames: number;
  tennisScore: string;
}

export type GameEvent =
  | { type: 'score'; scorer: 'player' | 'ai' }
  | { type: 'rally_milestone'; count: number }
  | { type: 'match_end'; winner: 'player' | 'ai'; playerScore: number; aiScore: number }
  | { type: 'time_warning' }
  | { type: 'hit'; by: 'player' | 'ai' }
  | { type: 'phase_change'; phase: string };

interface Particle { x: number; y: number; vx: number; vy: number; life: number; size: number; }

// 3D ball: x,y = court position, z = height
interface Ball3D { x: number; y: number; z: number; vx: number; vy: number; vz: number; r: number; }

export class TennisEngine {
  private c: HTMLCanvasElement;
  private x: CanvasRenderingContext2D;
  private W: number;
  private H: number;

  private ball!: Ball3D;
  // Player and AI as characters with x,y position on court
  private pl = { x: 0, y: 0, r: 14, speed: 300 };
  private ai = { x: 0, y: 0, r: 14, speed: 220 };
  private s!: GameState;
  private level: LevelConfig;
  private pers: AIPersonality;

  private frame = 0;
  private last = 0;
  private timer: number | null = null;
  private pts: Particle[] = [];
  private shake = { x: 0, y: 0, i: 0 };
  private sinceHit = 0;
  private serveTapped = false;

  // Court dimensions
  private court = { x: 0, y: 0, w: 0, h: 0 };
  private netY = 0;
  private serveBox = { top: 0, bottom: 0, leftW: 0, rightX: 0 };

  // Assets
  private courtImg = new Image();
  private crowdLeftImg = new Image();
  private crowdRightImg = new Image();
  private umpireImg = new Image();
  private assetsLoaded = false;

  // Pointer tracking
  private pointerX = 0;
  private pointerY = 0;

  private listeners: ((e: GameEvent) => void)[] = [];
  private G = 850; // gravity - lighter for more visible arc

  constructor(canvas: HTMLCanvasElement, level: LevelConfig, pers: AIPersonality) {
    this.c = canvas;
    this.x = canvas.getContext('2d')!;
    this.W = canvas.width;
    this.H = canvas.height;
    this.level = level;
    this.pers = pers;

    // Court: centered, takes up most of the canvas
    this.court.x = 20;
    this.court.y = 60;
    this.court.w = this.W - 40;
    this.court.h = this.H - 140;
    this.netY = this.court.y + this.court.h / 2;

    // Service box boundaries
    this.serveBox.top = this.court.y + this.court.h * 0.25;
    this.serveBox.bottom = this.netY;
    this.serveBox.leftW = this.court.x + this.court.w * 0.25;
    this.serveBox.rightX = this.court.x + this.court.w * 0.75;

    // Player starts at bottom baseline center
    this.pl.x = this.court.x + this.court.w / 2;
    this.pl.y = this.court.y + this.court.h - 40;

    // AI starts at top baseline center
    this.ai.x = this.court.x + this.court.w / 2;
    this.ai.y = this.court.y + 40;

    // Init ball
    this.resetBall();

    this.s = {
      playerScore: 0, aiScore: 0, rallyCount: 0, maxRally: 0,
      timeRemaining: level.timeLimit, phase: 'serve', server: 'player',
      message: '', msgTimer: 0, isPlaying: false,
      playerGames: 0, aiGames: 0, tennisScore: '0-0',
    };

    // Load assets
    this.courtImg.src = '/assets/court-new.png';
    this.crowdLeftImg.src = '/assets/crowd-left.png';
    this.crowdRightImg.src = '/assets/crowd-right.png';
    this.umpireImg.src = '/assets/umpire.png';

    Promise.all([
      new Promise<void>(r => { this.courtImg.onload = () => r(); this.courtImg.onerror = () => r(); }),
      new Promise<void>(r => { this.crowdLeftImg.onload = () => r(); this.crowdLeftImg.onerror = () => r(); }),
      new Promise<void>(r => { this.crowdRightImg.onload = () => r(); this.crowdRightImg.onerror = () => r(); }),
      new Promise<void>(r => { this.umpireImg.onload = () => r(); this.umpireImg.onerror = () => r(); }),
    ]).then(() => { this.assetsLoaded = true; });

    this.setupInput();
  }

  private resetBall() {
    this.ball = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r: 6 };
  }

  private setupInput() {
    const getPos = (e: MouseEvent | TouchEvent) => {
      const r = this.c.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const cy = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      return {
        x: (cx - r.left) * (this.W / r.width),
        y: (cy - r.top) * (this.H / r.height),
      };
    };

    this.c.addEventListener('touchmove', e => {
      e.preventDefault();
      const p = getPos(e);
      this.pointerX = p.x;
      this.pointerY = p.y;
    }, { passive: false });
    this.c.addEventListener('touchstart', e => {
      e.preventDefault();
      const p = getPos(e);
      this.pointerX = p.x;
      this.pointerY = p.y;
      if (this.s.phase === 'serve' && this.s.server === 'player') this.serveTapped = true;
    }, { passive: false });
    this.c.addEventListener('touchend', e => { e.preventDefault(); }, { passive: false });

    this.c.addEventListener('mousemove', e => {
      const p = getPos(e);
      this.pointerX = p.x;
      this.pointerY = p.y;
    });
    this.c.addEventListener('mousedown', e => {
      const p = getPos(e);
      this.pointerX = p.x;
      this.pointerY = p.y;
      if (this.s.phase === 'serve' && this.s.server === 'player') this.serveTapped = true;
    });

    window.addEventListener('keydown', e => {
      if ((e.key === ' ' || e.key === 'Space') && this.s.phase === 'serve' && this.s.server === 'player') {
        e.preventDefault();
        this.serveTapped = true;
      }
    });
  }

  addEventListener(fn: (e: GameEvent) => void) { this.listeners.push(fn); }
  removeEventListener(fn: (e: GameEvent) => void) { this.listeners = this.listeners.filter(f => f !== fn); }
  private emit(e: GameEvent) { this.listeners.forEach(f => f(e)); }

  start() {
    this.s.isPlaying = true;
    this.last = performance.now();
    this.gotoServe('player');
    if (this.level.timeLimit > 0) {
      this.timer = window.setInterval(() => {
        if (this.s.phase !== 'matchover') {
          this.s.timeRemaining--;
          if (this.s.timeRemaining <= 10) this.emit({ type: 'time_warning' });
          if (this.s.timeRemaining <= 0) this.endMatch();
        }
      }, 1000);
    }
    this.loop();
  }

  pause() { this.s.phase = 'matchover'; }
  resume() {
    if (this.s.phase === 'matchover') {
      const tgt = this.level.targetScore;
      if (this.s.playerScore < tgt && this.s.aiScore < tgt) {
        this.s.phase = 'serve';
        this.gotoServe(this.s.server);
      }
    }
    this.last = performance.now();
  }

  stop() {
    this.s.isPlaying = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    if (this.timer) clearInterval(this.timer);
  }

  // === SERVE ===
  private gotoServe(who: 'player' | 'ai') {
    this.s.phase = 'serve';
    this.s.server = who;
    this.s.rallyCount = 0;
    this.serveTapped = false;
    this.sinceHit = 0;
    this.s.message = '';
    this.s.msgTimer = 0;

    if (who === 'player') {
      this.ball.x = this.pl.x;
      this.ball.y = this.pl.y - 20;
    } else {
      this.ball.x = this.ai.x;
      this.ball.y = this.ai.y + 20;
    }
    this.ball.z = 0;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.vz = 0;
    this.emit({ type: 'phase_change', phase: 'serve' });
  }

  private doServe() {
    this.s.phase = 'play';
    const spd = this.level.ballBaseSpeed;

    if (this.s.server === 'player') {
      // Serve from player (bottom) to AI side (top)
      this.ball.x = this.pl.x;
      this.ball.y = this.pl.y - 10;
      // Serve toward one of the service boxes on AI side
      const targetX = this.court.x + this.court.w * (0.25 + Math.random() * 0.5);
      const targetY = this.court.y + this.court.h * 0.18;
      const dx = targetX - this.ball.x;
      const dy = targetY - this.ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this.ball.vx = (dx / dist) * spd * 0.7;
      this.ball.vy = (dy / dist) * spd * 0.7;
      this.ball.vz = 420; // high arc for clear visual
    } else {
      // AI serve
      this.ball.x = this.ai.x;
      this.ball.y = this.ai.y + 10;
      const targetX = this.court.x + this.court.w * (0.25 + Math.random() * 0.5);
      const targetY = this.court.y + this.court.h * 0.82;
      const dx = targetX - this.ball.x;
      const dy = targetY - this.ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this.ball.vx = (dx / dist) * spd * 0.65;
      this.ball.vy = (dy / dist) * spd * 0.65;
      this.ball.vz = 380;
    }

    this.spawnPt(this.ball.x, this.ball.y, 5);
    this.emit({ type: 'phase_change', phase: 'play' });
  }

  // === MAIN LOOP ===
  private loop = () => {
    if (!this.s.isPlaying) return;
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.update(dt);
    this.draw();
    this.frame = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.sinceHit += dt;

    // Message timer
    if (this.s.msgTimer > 0) {
      this.s.msgTimer -= dt;
      if (this.s.msgTimer <= 0) {
        this.s.message = '';
        if (this.s.phase === 'point') {
          this.gotoServe(this.s.server);
        }
      }
      this.updatePt(dt);
      this.updateShake();
      return;
    }

    // Serve phase
    if (this.s.phase === 'serve') {
      // Ball hovers near server
      this.ball.z = Math.max(0, Math.sin(Date.now() / 250) * 8 + 8);
      if (this.s.server === 'player' && this.serveTapped) {
        this.doServe();
        return;
      }
      if (this.s.server === 'ai' && this.sinceHit > 1.0) {
        this.doServe();
        return;
      }
      // Move player during serve
      this.movePlayer(dt);
      this.moveAI(dt);
      this.updatePt(dt);
      this.updateShake();
      return;
    }

    if (this.s.phase === 'matchover' || this.s.phase === 'point') {
      this.updatePt(dt);
      this.updateShake();
      return;
    }

    // === PLAY PHASE ===
    this.movePlayer(dt);
    this.moveAI(dt);

    // Ball 3D physics
    const sm = 1 + this.s.rallyCount * 0.012;
    this.ball.vz -= this.G * dt; // gravity reduces vz (vz positive = up)
    this.ball.x += this.ball.vx * sm * dt;
    this.ball.y += this.ball.vy * sm * dt;
    this.ball.z += this.ball.vz * dt;

    // Ball hits ground (bounce)
    if (this.ball.z <= 0) {
      this.ball.z = 0;
      // Bounce: reverse vertical velocity with energy loss
      const bounceEnergy = 0.72; // 72% energy retained per bounce
      this.ball.vz = Math.abs(this.ball.vz) * bounceEnergy;
      // Friction on ground
      this.ball.vx *= 0.88;
      this.ball.vy *= 0.88;
      // Particle effect on bounce
      if (Math.abs(this.ball.vz) > 40) {
        this.spawnPt(this.ball.x, this.ball.y, 3);
      }
      // Stop micro-bouncing
      if (Math.abs(this.ball.vz) < 15) {
        this.ball.vz = 0;
        this.ball.vx *= 0.95;
        this.ball.vy *= 0.95;
      }
    }

    // Wall bounds (court sides)
    if (this.ball.x - this.ball.r < this.court.x) {
      this.ball.x = this.court.x + this.ball.r;
      this.ball.vx = Math.abs(this.ball.vx) * 0.6;
    }
    if (this.ball.x + this.ball.r > this.court.x + this.court.w) {
      this.ball.x = this.court.x + this.court.w - this.ball.r;
      this.ball.vx = -Math.abs(this.ball.vx) * 0.6;
    }

    // Net collision (ball trying to cross net while too low)
    const netHeight = 20;
    const ballCrossingNet = (this.ball.vy < 0 && this.ball.y <= this.netY && this.ball.y + this.ball.vy * dt * 2 > this.netY) ||
                            (this.ball.vy > 0 && this.ball.y >= this.netY && this.ball.y + this.ball.vy * dt * 2 < this.netY);
    if (ballCrossingNet && this.ball.z < netHeight && this.ball.z > 0) {
      // Hit the net!
      this.ball.vy *= -0.3;
      this.ball.vz = Math.abs(this.ball.vz) * 0.5;
      this.spawnPt(this.ball.x, this.netY, 4);
      // Net fault - ball drops, someone will miss it
    }

    // Player auto-hit: ball close to player and coming toward player
    const pdx = this.ball.x - this.pl.x;
    const pdy = this.ball.y - this.pl.y;
    const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
    const ballTowardPlayer = this.ball.vy > 0; // ball moving down toward player

    if (pDist < this.pl.r + this.ball.r + 8 && ballTowardPlayer && this.sinceHit > 0.15 && this.ball.z < 25) {
      this.hit('player');
    }

    // AI auto-hit
    const adx = this.ball.x - this.ai.x;
    const ady = this.ball.y - this.ai.y;
    const aDist = Math.sqrt(adx * adx + ady * ady);
    const ballTowardAI = this.ball.vy < 0;

    if (aDist < this.ai.r + this.ball.r + 8 && ballTowardAI && this.sinceHit > 0.15 && this.ball.z < 25) {
      // AI miss chance
      if (Math.random() < this.pers.errorRate * 0.3) {
        // AI misses intentionally
      } else {
        this.hit('ai');
      }
    }

    // Score: ball out of court (past baseline)
    if (this.ball.y > this.court.y + this.court.h + 10) {
      // Ball went past player baseline - AI scores if ball was in play
      if (this.ball.x >= this.court.x && this.ball.x <= this.court.x + this.court.w) {
        this.point('ai', `${this.pers.name} SCORES!`);
      } else {
        // Out of bounds
        this.point('ai', 'OUT!');
      }
      return;
    }
    if (this.ball.y < this.court.y - 10) {
      if (this.ball.x >= this.court.x && this.ball.x <= this.court.x + this.court.w) {
        this.point('player', 'YOU SCORE!');
      } else {
        this.point('player', 'OUT!');
      }
      return;
    }

    // Particles & shake
    this.updatePt(dt);
    this.updateShake();
  }

  private movePlayer(dt: number) {
    // Player follows pointer, clamped to court
    const tx = Math.max(this.court.x + this.pl.r, Math.min(this.court.x + this.court.w - this.pl.r, this.pointerX));
    const ty = Math.max(this.netY + 10, Math.min(this.court.y + this.court.h - this.pl.r, this.pointerY));
    // Smooth follow
    const dx = tx - this.pl.x;
    const dy = ty - this.pl.y;
    const speed = this.pl.speed * dt;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 1) {
      const move = Math.min(dist, speed);
      this.pl.x += (dx / dist) * move;
      this.pl.y += (dy / dist) * move;
    }
  }

  private moveAI(dt: number) {
    let tx: number, ty: number;

    if (this.s.phase === 'serve') {
      tx = this.court.x + this.court.w / 2;
      ty = this.court.y + 30;
    } else if (this.ball.vy > 0) {
      // Ball going toward player, AI returns to defensive position
      tx = this.court.x + this.court.w / 2;
      ty = this.court.y + this.court.h * 0.2;
    } else {
      // Ball coming toward AI, track it
      const reactionError = (1 - this.pers.reactionSpeed) * 40;
      tx = this.ball.x + (Math.random() - 0.5) * reactionError;
      ty = Math.min(this.ball.y, this.court.y + this.court.h * 0.3);
    }

    tx = Math.max(this.court.x + this.ai.r, Math.min(this.court.x + this.court.w - this.ai.r, tx));
    ty = Math.max(this.court.y + this.ai.r, Math.min(this.netY - 10, ty));

    const dx = tx - this.ai.x;
    const dy = ty - this.ai.y;
    const speed = this.level.aiSpeed * dt;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 1) {
      const move = Math.min(dist, speed);
      this.ai.x += (dx / dist) * move;
      this.ai.y += (dy / dist) * move;
    }
  }

  private hit(who: 'player' | 'ai') {
    this.sinceHit = 0;
    const spd = this.level.ballBaseSpeed;

    if (who === 'player') {
      // Hit toward AI side (up) with nice arc
      const targetX = this.court.x + this.court.w * (0.12 + Math.random() * 0.76);
      const targetY = this.court.y + this.court.h * 0.08 + Math.random() * 40;
      const dx = targetX - this.ball.x;
      const dy = targetY - this.ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = spd * (0.75 + Math.random() * 0.2);
      this.ball.vx = (dx / dist) * speed;
      this.ball.vy = (dy / dist) * speed;
      // Higher arc for longer distances
      this.ball.vz = 250 + dist * 0.4;
      this.ball.vz = Math.min(this.ball.vz, 450);
    } else {
      // AI hit toward player side (down)
      const targetX = this.court.x + this.court.w * (0.12 + Math.random() * 0.76);
      const targetY = this.court.y + this.court.h * 0.82 + Math.random() * 40;
      const dx = targetX - this.ball.x;
      const dy = targetY - this.ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = spd * (0.65 + Math.random() * 0.2);
      this.ball.vx = (dx / dist) * speed;
      this.ball.vy = (dy / dist) * speed;
      this.ball.vz = 200 + dist * 0.35;
      this.ball.vz = Math.min(this.ball.vz, 400);
    }

    this.spawnPt(this.ball.x, this.ball.y, 6);
    this.shake.i = 5;

    this.s.rallyCount++;
    if (this.s.rallyCount > this.s.maxRally) this.s.maxRally = this.s.rallyCount;
    if (this.s.rallyCount > 0 && this.s.rallyCount % 3 === 0) {
      this.emit({ type: 'rally_milestone', count: this.s.rallyCount });
    }
    this.emit({ type: 'hit', by: who });
  }

  private point(scorer: 'player' | 'ai', msg: string) {
    this.s.phase = 'point';
    if (scorer === 'player') { this.s.playerScore++; this.shake.i = 10; }
    else { this.s.aiScore++; this.shake.i = 10; }
    this.s.rallyCount = 0;
    this.s.message = msg;
    this.s.msgTimer = 1.5;
    this.s.server = scorer;
    this.updateTennisScore();
    this.emit({ type: 'score', scorer });

    const tgt = this.level.targetScore;
    if (this.s.playerScore >= tgt || this.s.aiScore >= tgt) {
      if (this.s.playerScore !== this.s.aiScore) {
        this.s.phase = 'matchover';
        const w = this.s.playerScore > this.s.aiScore ? 'player' : 'ai';
        this.emit({ type: 'match_end', winner: w, playerScore: this.s.playerScore, aiScore: this.s.aiScore });
      }
    }
  }

  private updateTennisScore() {
    // Convert points to tennis display (0, 15, 30, 40, AD)
    this.s.tennisScore = `${this.s.playerScore}-${this.s.aiScore}`;
  }

  private endMatch() {
    this.s.phase = 'matchover';
    this.s.isPlaying = false;
    const w = this.s.playerScore >= this.s.aiScore ? 'player' : 'ai';
    this.emit({ type: 'match_end', winner: w, playerScore: this.s.playerScore, aiScore: this.s.aiScore });
  }

  private spawnPt(x: number, y: number, n: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 30 + Math.random() * 100;
      this.pts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.3 + Math.random() * 0.3, size: 2 + Math.random() * 3 });
    }
  }

  private updatePt(dt: number) {
    this.pts = this.pts.filter(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 200 * dt; p.life -= dt; return p.life > 0; });
  }

  private updateShake() {
    if (this.shake.i > 0) {
      this.shake.x = (Math.random() - 0.5) * this.shake.i;
      this.shake.y = (Math.random() - 0.5) * this.shake.i;
      this.shake.i *= 0.9;
      if (this.shake.i < 0.5) { this.shake.i = 0; this.shake.x = 0; this.shake.y = 0; }
    }
  }

  // === DRAW ===
  private draw() {
    const c = this.x;
    c.save();
    c.translate(this.shake.x, this.shake.y);
    this.drawCourt(c);
    this.drawCrowd(c);
    this.drawUmpire(c);
    this.drawNet(c);
    this.drawPlayer(c);
    this.drawAI(c);
    this.drawBall(c);
    this.drawParticles(c);
    this.drawHUD(c);
    this.drawServePrompt(c);
    this.drawMessage(c);
    c.restore();
  }

  private drawCourt(c: CanvasRenderingContext2D) {
    // Background
    c.fillStyle = C.BG;
    c.fillRect(0, 0, this.W, this.H);

    const { x: cx, y: cy, w: cw, h: ch } = this.court;

    // Draw court image if loaded, fallback to procedural
    if (this.assetsLoaded && this.courtImg.complete && this.courtImg.naturalWidth > 0) {
      // Draw court image scaled to fit
      c.drawImage(this.courtImg, cx - 10, cy - 10, cw + 20, ch + 20);
    } else {
      // Fallback: procedural court
      c.fillStyle = C.COURT_BG;
      c.fillRect(cx - 4, cy - 4, cw + 8, ch + 8);
      c.fillStyle = C.COURT_IN;
      c.fillRect(cx, cy, cw, ch);

      // Court lines
      c.strokeStyle = C.LINE;
      c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + cw, cy); c.stroke();
      c.beginPath(); c.moveTo(cx, cy + ch); c.lineTo(cx + cw, cy + ch); c.stroke();
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy + ch); c.stroke();
      c.beginPath(); c.moveTo(cx + cw, cy); c.lineTo(cx + cw, cy + ch); c.stroke();

      const serviceLineTop = cy + ch * 0.25;
      const serviceLineBottom = cy + ch * 0.75;
      c.beginPath(); c.moveTo(cx, serviceLineTop); c.lineTo(cx + cw, serviceLineTop); c.stroke();
      c.beginPath(); c.moveTo(cx, serviceLineBottom); c.lineTo(cx + cw, serviceLineBottom); c.stroke();
      c.beginPath(); c.moveTo(cx + cw / 2, serviceLineTop); c.lineTo(cx + cw / 2, serviceLineBottom); c.stroke();

      // Center mark dashes
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(cx + cw / 2, cy - 3); c.lineTo(cx + cw / 2, cy + 8); c.stroke();
      c.beginPath(); c.moveTo(cx + cw / 2, cy + ch - 8); c.lineTo(cx + cw / 2, cy + ch + 3); c.stroke();
    }
  }

  private drawCrowd(c: CanvasRenderingContext2D) {
    if (!this.assetsLoaded) return;
    const { x: cx, y: cy, w: cw, h: ch } = this.court;

    // Left crowd
    if (this.crowdLeftImg.complete && this.crowdLeftImg.naturalWidth > 0) {
      const clSize = 60;
      c.save();
      c.globalAlpha = 0.7;
      // Draw multiple crowd sprites along left edge
      for (let i = 0; i < 4; i++) {
        const cy_pos = cy + (ch / 4) * i + 10;
        c.drawImage(this.crowdLeftImg, cx - clSize - 5, cy_pos - clSize / 2, clSize, clSize);
      }
      c.restore();
    }

    // Right crowd
    if (this.crowdRightImg.complete && this.crowdRightImg.naturalWidth > 0) {
      const crSize = 60;
      c.save();
      c.globalAlpha = 0.7;
      for (let i = 0; i < 4; i++) {
        const cy_pos = cy + (ch / 4) * i + 10;
        c.drawImage(this.crowdRightImg, cx + cw + 5, cy_pos - crSize / 2, crSize, crSize);
      }
      c.restore();
    }
  }

  private drawUmpire(c: CanvasRenderingContext2D) {
    if (!this.assetsLoaded) return;
    const { x: cx, w: cw } = this.court;

    if (this.umpireImg.complete && this.umpireImg.naturalWidth > 0) {
      const uw = 40;
      const uh = 40;
      const ux = cx + cw / 2 - uw / 2;
      const uy = this.netY - uh + 5;
      c.save();
      c.globalAlpha = 0.85;
      c.drawImage(this.umpireImg, ux, uy, uw, uh);
      c.restore();
    }
  }

  private drawNet(c: CanvasRenderingContext2D) {
    const { x: cx, w: cw } = this.court;

    // Net posts
    c.fillStyle = C.NET;
    c.fillRect(cx - 6, this.netY - 3, 6, 6);
    c.fillRect(cx + cw, this.netY - 3, 6, 6);

    // Net mesh
    c.strokeStyle = C.NET_MESH;
    c.lineWidth = 0.5;
    for (let x = cx; x <= cx + cw; x += 6) {
      c.beginPath(); c.moveTo(x, this.netY - 8); c.lineTo(x, this.netY + 8); c.stroke();
    }
    for (let y = this.netY - 8; y <= this.netY + 8; y += 3) {
      c.beginPath(); c.moveTo(cx, y); c.lineTo(cx + cw, y); c.stroke();
    }

    // Net top tape (white with red edge)
    c.strokeStyle = 'rgba(255,255,255,0.9)';
    c.lineWidth = 2;
    c.shadowColor = C.NET;
    c.shadowBlur = 4;
    c.beginPath(); c.moveTo(cx - 4, this.netY); c.lineTo(cx + cw + 4, this.netY); c.stroke();
    c.shadowBlur = 0;
  }

  private drawPlayer(c: CanvasRenderingContext2D) {
    this.drawCharacter(c, this.pl.x, this.pl.y, this.pl.r, C.PLAYER, true);
  }

  private drawAI(c: CanvasRenderingContext2D) {
    this.drawCharacter(c, this.ai.x, this.ai.y, this.ai.r, C.AI, false);
  }

  private drawCharacter(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, isPlayer: boolean) {
    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.4)';
    c.beginPath(); c.ellipse(x, y + r * 0.7, r * 0.7, r * 0.25, 0, 0, Math.PI * 2); c.fill();

    // Body
    c.fillStyle = color;
    c.shadowColor = color;
    c.shadowBlur = 10;
    c.beginPath();
    c.arc(x, y - r * 0.3, r * 0.6, 0, Math.PI * 2);
    c.fill();

    // Racket
    const angle = isPlayer ? -Math.PI / 4 : Math.PI / 4;
    const rx = x + Math.cos(angle) * r;
    const ry = (y - r * 0.3) + Math.sin(angle) * r;
    c.strokeStyle = '#888';
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(x, y - r * 0.3); c.lineTo(rx, ry); c.stroke();
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(rx, ry, r * 0.35, r * 0.5, angle, 0, Math.PI * 2);
    c.fill();

    // Head
    c.fillStyle = '#d4a066';
    c.beginPath();
    c.arc(x, y - r * 1.1, r * 0.35, 0, Math.PI * 2);
    c.fill();

    c.shadowBlur = 0;
  }

  private drawBall(c: CanvasRenderingContext2D) {
    const b = this.ball;
    if (b.z < 0) return; // Don't draw if underground

    // Shadow on court - always at z=0, shrinks as ball goes higher
    const heightRatio = Math.min(b.z / 150, 1);
    const shadowW = b.r * (1.8 - heightRatio * 0.8);
    const shadowH = b.r * (0.9 - heightRatio * 0.5);
    const shadowAlpha = 0.35 - heightRatio * 0.25;

    // Outer shadow (soft)
    c.fillStyle = `rgba(0,0,0,${shadowAlpha * 0.5})`;
    c.beginPath();
    c.ellipse(b.x, b.y, shadowW * 1.3, shadowH * 1.3, 0, 0, Math.PI * 2);
    c.fill();
    // Inner shadow (darker core)
    c.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
    c.beginPath();
    c.ellipse(b.x, b.y, shadowW, shadowH, 0, 0, Math.PI * 2);
    c.fill();

    // Ball drawn at y - z (higher on screen as z increases)
    const drawY = b.y - b.z;
    const ballSize = b.r + b.z * 0.015;

    // Ball trail when moving fast
    const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (speed > 150 && b.z > 5) {
      c.strokeStyle = 'rgba(255,255,0,0.15)';
      c.lineWidth = ballSize * 0.8;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(b.x - b.vx * 0.03, drawY - b.vy * 0.03);
      c.lineTo(b.x, drawY);
      c.stroke();
    }

    // Ball glow
    const glowSize = ballSize * (2 + heightRatio);
    const glow = c.createRadialGradient(b.x, drawY, ballSize * 0.4, b.x, drawY, glowSize);
    glow.addColorStop(0, 'rgba(255,255,100,0.5)');
    glow.addColorStop(0.5, 'rgba(255,255,0,0.2)');
    glow.addColorStop(1, 'transparent');
    c.fillStyle = glow;
    c.beginPath(); c.arc(b.x, drawY, glowSize, 0, Math.PI * 2); c.fill();

    // Main ball
    c.fillStyle = C.BALL;
    c.shadowColor = 'rgba(255,255,50,0.9)';
    c.shadowBlur = 10 + heightRatio * 6;
    c.beginPath();
    c.arc(b.x, drawY, Math.max(3, ballSize), 0, Math.PI * 2);
    c.fill();
    c.shadowBlur = 0;

    // White highlight (top-left)
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.beginPath();
    c.arc(b.x - ballSize * 0.3, drawY - ballSize * 0.3, ballSize * 0.35, 0, Math.PI * 2);
    c.fill();

    // Tennis seam lines (curved white lines for detail)
    c.strokeStyle = 'rgba(255,255,255,0.3)';
    c.lineWidth = 1;
    c.beginPath();
    c.arc(b.x, drawY, ballSize * 0.6, -Math.PI * 0.6, Math.PI * 0.6);
    c.stroke();
  }

  private drawParticles(c: CanvasRenderingContext2D) {
    this.pts.forEach(p => {
      c.fillStyle = `rgba(57,255,20,${p.life / 0.6})`;
      c.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
  }

  private drawHUD(c: CanvasRenderingContext2D) {
    // Score
    c.textAlign = 'center';
    c.font = 'bold 28px "Fredoka One", sans-serif';
    c.shadowColor = C.LINE;
    c.shadowBlur = 8;
    c.fillStyle = C.PLAYER;
    c.fillText(`${this.s.playerScore}`, this.W / 2 - 35, 32);
    c.fillStyle = 'rgba(255,255,255,0.3)';
    c.fillText('-', this.W / 2, 30);
    c.fillStyle = C.AI;
    c.fillText(`${this.s.aiScore}`, this.W / 2 + 35, 32);
    c.shadowBlur = 0;

    // Rally
    if (this.s.rallyCount > 1) {
      c.font = 'bold 11px sans-serif';
      c.fillStyle = 'rgba(57,255,20,0.55)';
      c.fillText(`RALLY ${this.s.rallyCount}`, this.W / 2, 48);
    }

    // Timer
    if (this.level.timeLimit > 0) {
      c.font = 'bold 14px monospace';
      c.fillStyle = this.s.timeRemaining <= 10 ? C.AI : 'rgba(255,255,255,0.4)';
      c.textAlign = 'right';
      c.fillText(`${Math.floor(this.s.timeRemaining / 60)}:${String(this.s.timeRemaining % 60).padStart(2, '0')}`, this.W - 12, 22);
    }

    // Level
    c.font = 'bold 10px sans-serif';
    c.fillStyle = 'rgba(255,255,255,0.3)';
    c.textAlign = 'left';
    c.fillText(`Lv.${this.level.id}`, 12, 20);

    // Labels
    c.textAlign = 'left';
    c.fillStyle = C.PLAYER;
    c.font = 'bold 9px sans-serif';
    c.fillText('YOU', 12, this.H - 12);
    c.textAlign = 'right';
    c.fillStyle = C.AI;
    c.fillText(this.pers.name.toUpperCase(), this.W - 12, 55);
  }

  private drawServePrompt(c: CanvasRenderingContext2D) {
    if (this.s.phase !== 'serve' || this.s.server !== 'player') return;
    const pulse = 0.6 + Math.sin(Date.now() / 180) * 0.4;
    c.textAlign = 'center';
    c.font = 'bold 14px "Fredoka One", sans-serif';
    c.fillStyle = `rgba(57,255,20,${pulse})`;
    c.shadowColor = C.PLAYER;
    c.shadowBlur = 12;
    c.fillText('TAP OR SPACE TO SERVE', this.W / 2, this.H * 0.5);
    c.shadowBlur = 0;
  }

  private drawMessage(c: CanvasRenderingContext2D) {
    if (!this.s.message || this.s.msgTimer <= 0) return;
    const a = Math.min(1, this.s.msgTimer / 0.3);
    const good = this.s.message.includes('YOU') || this.s.message === 'OUT!';
    c.textAlign = 'center';
    c.font = 'bold 24px "Fredoka One", sans-serif';
    c.fillStyle = good ? `rgba(57,255,14,${a})` : `rgba(255,68,68,${a})`;
    c.shadowColor = good ? C.PLAYER : C.AI;
    c.shadowBlur = 15;
    c.fillText(this.s.message, this.W / 2, this.H * 0.38);
    c.shadowBlur = 0;
  }

  getState(): GameState { return { ...this.s }; }
  destroy() { this.stop(); }
}
