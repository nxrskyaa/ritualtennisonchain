import { defineChain } from 'viem';

// ============================================================
// RITUAL TESTNET CHAIN CONFIG
// Docs: https://docs.ritualfoundation.org
// ============================================================
export const ritualChain = defineChain({
  id: 1979,
  name: 'Ritual Chain',
  nativeCurrency: {
    name: 'RITUAL',
    symbol: 'RITUAL',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.ritualfoundation.org'] },
    public: { http: ['https://rpc.ritualfoundation.org'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.ritualfoundation.org' },
  },
});

// Export as ritualTestnet for backward compatibility
export const ritualTestnet = ritualChain;

// ============================================================
// IMPORTANT: Ganti alamat di bawah ini dengan contract address
// kamu yang sudah di-deploy via Remix di Ritual Testnet.
//
// Cara dapat address:
// 1. Buka Remix → tab "Deploy & Run" → lihat "Deployed Contracts"
// 2. Copy alamat contract (0x...)
// 3. Paste di bawah ini, ganti 0x0000...
// ============================================================
export const GAME_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// Helper untuk cek apakah contract address sudah di-set
export const isContractConfigured = () => {
  return GAME_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';
};

// ABI contract game (harus sama persis dengan contract di Remix)
export const GAME_CONTRACT_ABI = [
  {
    inputs: [],
    name: 'registerPlayer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'levelId', type: 'uint256' },
      { name: 'playerScore', type: 'uint256' },
      { name: 'aiScore', type: 'uint256' },
      { name: 'starsEarned', type: 'uint256' },
      { name: 'rallyLength', type: 'uint256' },
      { name: 'aiPersonalityHash', type: 'bytes32' },
    ],
    name: 'submitMatchResult',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'score', type: 'uint256' }],
    name: 'updateEndlessScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'players',
    outputs: [
      { name: 'username', type: 'string' },
      { name: 'totalMatches', type: 'uint256' },
      { name: 'totalWins', type: 'uint256' },
      { name: 'totalStars', type: 'uint256' },
      { name: 'endlessHighScore', type: 'uint256' },
      { name: 'lastPlayedAt', type: 'uint256' },
      { name: 'exists', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '', type: 'address' },
      { name: '', type: 'uint256' },
    ],
    name: 'levelBestStars',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'username', type: 'string' },
    ],
    name: 'PlayerRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: true, name: 'levelId', type: 'uint256' },
      { indexed: false, name: 'stars', type: 'uint256' },
      { indexed: false, name: 'rallyLength', type: 'uint256' },
    ],
    name: 'MatchCompleted',
    type: 'event',
  },
] as const;

export const LEVELS = [
  { id: 1, name: 'The Basics', targetScore: 3, aiSpeed: 180, aiErrorMargin: 40, ballBaseSpeed: 280, timeLimit: 0, description: 'Learn the basics', unlockRequirement: 0 },
  { id: 2, name: 'Rally Master', targetScore: 3, aiSpeed: 220, aiErrorMargin: 30, ballBaseSpeed: 300, timeLimit: 0, description: 'Master the rally', unlockRequirement: 1 },
  { id: 3, name: 'Speedster', targetScore: 3, aiSpeed: 260, aiErrorMargin: 25, ballBaseSpeed: 330, timeLimit: 0, description: 'Speed increases', unlockRequirement: 2 },
  { id: 4, name: 'The Clock', targetScore: 5, aiSpeed: 240, aiErrorMargin: 20, ballBaseSpeed: 310, timeLimit: 60, description: 'Beat the clock', unlockRequirement: 3 },
  { id: 5, name: 'Wind Zones', targetScore: 5, aiSpeed: 300, aiErrorMargin: 15, ballBaseSpeed: 350, timeLimit: 0, description: 'Watch the wind', unlockRequirement: 4 },
  { id: 6, name: 'Split Court', targetScore: 5, aiSpeed: 340, aiErrorMargin: 12, ballBaseSpeed: 370, timeLimit: 0, description: 'Navigate the gap', unlockRequirement: 5 },
  { id: 7, name: 'Dual Balls', targetScore: 5, aiSpeed: 320, aiErrorMargin: 10, ballBaseSpeed: 360, timeLimit: 0, description: 'Two balls at once', unlockRequirement: 6 },
  { id: 8, name: 'Shrink Racket', targetScore: 7, aiSpeed: 380, aiErrorMargin: 8, ballBaseSpeed: 400, timeLimit: 0, description: 'Smaller racket', unlockRequirement: 7 },
  { id: 9, name: 'Invisible Ball', targetScore: 7, aiSpeed: 420, aiErrorMargin: 5, ballBaseSpeed: 430, timeLimit: 0, description: 'Track carefully', unlockRequirement: 8 },
  { id: 10, name: 'Legend Finals', targetScore: 7, aiSpeed: 460, aiErrorMargin: 3, ballBaseSpeed: 460, timeLimit: 0, description: 'Become a legend', unlockRequirement: 9 },
] as const;
