import { useState, useCallback, useEffect } from 'react';
import type { GameScreen, LevelProgress, GameSettings, AIPersonality } from '@/types/game';
import { LEVELS } from '@/config/ritual';
import { useWeb3 } from '@/hooks/useWeb3';
import MainMenu from '@/sections/MainMenu';
import LevelSelect from '@/sections/LevelSelect';
import GameplayScreen from '@/sections/GameScreen';
import LeaderboardScreen from '@/sections/Leaderboard';
import ProfileScreen from '@/sections/Profile';
import ProfileCreation from '@/sections/ProfileCreation';
import HowToPlay from '@/sections/HowToPlay';
import WalletConnect from '@/sections/WalletConnect';
import MatchResult from '@/sections/MatchResult';
import LoadingScreen from '@/sections/LoadingScreen';
import AboutScreen from '@/sections/About';
import { Toaster, toast } from 'sonner';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  difficulty: 'medium',
  showFPS: false,
};

const AI_NAMES = ['Clawbot', 'Spark', 'Volt', 'Neon', 'Hex', 'Pulse', 'Core', 'Byte'];
const AI_STYLES: Array<'aggressive' | 'defensive' | 'balanced'> = ['aggressive', 'defensive', 'balanced'];
const AI_SHOTS: Array<'smash' | 'lob' | 'drive'> = ['smash', 'lob', 'drive'];

const generateAIPersonality = (levelId: number): AIPersonality => {
  const diffMult = levelId / 10;
  return {
    name: AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)],
    playstyle: AI_STYLES[Math.floor(Math.random() * AI_STYLES.length)],
    reactionSpeed: 0.4 + diffMult * 0.5 + Math.random() * 0.1,
    errorRate: Math.max(0, 0.5 - diffMult * 0.4),
    favoriteShot: AI_SHOTS[Math.floor(Math.random() * AI_SHOTS.length)],
  };
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState<Record<number, LevelProgress>>(() => {
    const saved = localStorage.getItem('ritual_level_progress');
    return saved ? JSON.parse(saved) : {};
  });
  const [settings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('ritual_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [playerChar] = useState(() => {
    const saved = localStorage.getItem('ritual_player_char');
    return saved || '/assets/char1.png';
  });
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [showMatchResult, setShowMatchResult] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [matchResult, setMatchResult] = useState<{
    winner: 'player' | 'ai';
    playerScore: number;
    aiScore: number;
    maxRally: number;
    levelId: number;
    aiPersonality: AIPersonality;
  } | null>(null);

  const web3 = useWeb3();

  useEffect(() => {
    localStorage.setItem('ritual_settings', JSON.stringify(settings));
  }, [settings]);

  // ESC key to go back to menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showMatchResult) {
          setShowMatchResult(false);
        }
        if (showWalletConnect) {
          setShowWalletConnect(false);
        } else if (currentScreen !== 'menu' && currentScreen !== 'playing') {
          setCurrentScreen('menu');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, showMatchResult, showWalletConnect]);

  const saveLevelProgress = useCallback((levelId: number, stars: number, won: boolean) => {
    setLevelProgress(prev => {
      const current = prev[levelId];
      const newProgress: LevelProgress = {
        bestScore: Math.max(current?.bestScore || 0, won ? 1 : 0),
        stars: Math.max(current?.stars || 0, stars),
        completed: current?.completed || won,
      };
      const updated = { ...prev, [levelId]: newProgress };
      localStorage.setItem('ritual_level_progress', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handlePlay = useCallback(() => setCurrentScreen('levelSelect'), []);
  const handleSelectLevel = useCallback((levelId: number) => {
    setSelectedLevel(levelId);
    setCurrentScreen('playing');
  }, []);

  const handleMatchEnd = useCallback(async (winner: 'player' | 'ai', playerScore: number, aiScore: number, maxRally: number, aiPersonality: AIPersonality) => {
    let stars = 0;
    if (winner === 'player') {
      if (playerScore === 3 && aiScore === 0) stars = 3;
      else if (playerScore === 3 && aiScore === 1) stars = 2;
      else if (playerScore > aiScore) stars = 1;
    }
    // Bonus star for long rally
    if (maxRally >= 10) stars = Math.min(3, stars + 1);

    saveLevelProgress(selectedLevel, stars, winner === 'player');

    // Kirim score ke smart contract Ritual Testnet (kalau wallet connected)
    if (web3.isConnected && web3.isOnRitual) {
      toast.loading('Submitting score to Ritual Testnet...', { id: 'submit-score' });

      let result;

      // Step 1: Cek apakah player sudah registered
      const profile = await web3.readProfile(web3.account!);
      if (!profile || !profile.exists) {
        toast.loading('Registering player on-chain...', { id: 'submit-score' });
        const regResult = await web3.registerPlayer();
        if (!regResult.success) {
          toast.error(`Registration failed: ${regResult.error}`, { id: 'submit-score', duration: 4000 });
        } else {
          toast.success('Player registered! Now submitting score...', { id: 'submit-score' });
        }
      }

      // Step 2: Submit match result
      result = await web3.submitMatchResult(
        selectedLevel,
        playerScore,
        aiScore,
        stars,
        maxRally,
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      );

      if (result.success) {
        // Simpan tx hash ke localStorage untuk history
        const txHistory = JSON.parse(localStorage.getItem('ritual_tx_history') || '[]');
        txHistory.unshift({
          hash: result.hash,
          level: selectedLevel,
          playerScore,
          aiScore,
          stars,
          timestamp: Date.now(),
        });
        // Keep only last 20
        localStorage.setItem('ritual_tx_history', JSON.stringify(txHistory.slice(0, 20)));

        toast.success(
          <div className="flex flex-col gap-1">
            <span>Score saved on-chain!</span>
            <a
              href={`https://explorer.ritualfoundation.org/tx/${result.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#39ff14] underline text-xs"
            >
              View on Explorer
            </a>
          </div>,
          { id: 'submit-score', duration: 5000 }
        );
      } else {
        toast.error(`Submit failed: ${result.error}`, { id: 'submit-score', duration: 4000 });
      }
    }

    setMatchResult({ winner, playerScore, aiScore, maxRally, levelId: selectedLevel, aiPersonality });
    setShowMatchResult(true);
  }, [selectedLevel, saveLevelProgress, web3]);

  const handleBackToMenu = useCallback(() => {
    setCurrentScreen('menu');
    setShowMatchResult(false);
  }, []);

  const handleCreateProfile = useCallback((_name: string, _characterId: number) => {
    // Will be enhanced with on-chain contract call when deployed
    setCurrentScreen('menu');
  }, []);

  const handleNextLevel = useCallback(() => {
    setShowMatchResult(false);
    if (selectedLevel < 10) {
      setSelectedLevel(selectedLevel + 1);
      setCurrentScreen('playing');
    } else {
      setCurrentScreen('levelSelect');
    }
  }, [selectedLevel]);

  const isLevelUnlocked = useCallback((levelId: number) => {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return false;
    if (level.unlockRequirement === 0) return true;
    return levelProgress[level.unlockRequirement]?.completed || false;
  }, [levelProgress]);

  const getDifficultyMultiplier = () => {
    switch (settings.difficulty) {
      case 'easy': return 0.7;
      case 'hard': return 1.4;
      default: return 1.0;
    }
  };

  const getAdjustedLevel = () => {
    const base = LEVELS.find(l => l.id === selectedLevel);
    if (!base) return LEVELS[0];
    const mult = getDifficultyMultiplier();
    return { ...base, aiSpeed: Math.round(base.aiSpeed * mult), ballBaseSpeed: Math.round(base.ballBaseSpeed * mult) };
  };

  const totalStars = Object.values(levelProgress).reduce((sum, p) => sum + p.stars, 0);

  // Loading screen
  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden select-none">
      <Toaster position="top-center" richColors />

      {currentScreen === 'menu' && (
        <MainMenu totalStars={totalStars} isConnected={web3.isConnected} account={web3.account}
          onPlay={handlePlay} onLeaderboard={() => setCurrentScreen('leaderboard')}
          onProfile={() => setCurrentScreen('profile')} onHowToPlay={() => setCurrentScreen('howToPlay')}
          onAbout={() => setShowAbout(true)}
          onConnectWallet={() => setShowWalletConnect(true)} onDisconnect={web3.disconnect} />
      )}

      {currentScreen === 'levelSelect' && (
        <LevelSelect levelProgress={levelProgress} isLevelUnlocked={isLevelUnlocked}
          onSelectLevel={handleSelectLevel} onBack={handleBackToMenu} />
      )}

      {currentScreen === 'playing' && (
        <GameplayScreen level={getAdjustedLevel()} aiPersonality={generateAIPersonality(selectedLevel)}
          playerChar={playerChar}
          onMatchEnd={handleMatchEnd} onBackToMenu={handleBackToMenu}
          onRestart={() => setCurrentScreen('playing')} />
      )}

      {currentScreen === 'leaderboard' && (
        <LeaderboardScreen levelProgress={levelProgress} onBack={handleBackToMenu} />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen levelProgress={levelProgress} totalStars={totalStars}
          isConnected={web3.isConnected} account={web3.account}
          onBack={handleBackToMenu} onConnectWallet={() => setShowWalletConnect(true)}
          onCreateProfile={() => setCurrentScreen('profileCreation')} />
      )}

      {currentScreen === 'profileCreation' && (
        <ProfileCreation
          isConnected={web3.isConnected} account={web3.account}
          onBack={() => setCurrentScreen('profile')}
          onConnectWallet={() => setShowWalletConnect(true)}
          onCreateProfile={handleCreateProfile} />
      )}

      {currentScreen === 'howToPlay' && <HowToPlay onBack={handleBackToMenu} />}

      {showAbout && <AboutScreen onBack={() => setShowAbout(false)} />}

      {showWalletConnect && (
        <WalletConnect
          onConnect={web3.connect}
          onDisconnect={web3.disconnect}
          onClose={() => setShowWalletConnect(false)}
          isConnecting={web3.isConnecting}
          isConnected={web3.isConnected}
          account={web3.account}
          isOnRitual={web3.isOnRitual}
          chainId={web3.chainId}
          error={web3.error}
        />
      )}

      {showMatchResult && matchResult && (
        <MatchResult result={matchResult} onNextLevel={handleNextLevel}
          onRetry={() => { setShowMatchResult(false); setCurrentScreen('playing'); }}
          onMenu={handleBackToMenu} hasNextLevel={selectedLevel < 10} />
      )}
    </div>
  );
}
