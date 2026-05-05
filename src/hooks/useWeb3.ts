import { useState, useCallback, useEffect, useRef } from 'react';
import { createPublicClient, http, type Address } from 'viem';
import { ritualChain, GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI } from '@/config/ritual';
import type { PlayerProfile } from '@/types/game';

const CHAIN_ID_HEX = '0x7BF'; // 1979 in hex

const RITUAL_CHAIN_PARAMS = {
  chainId: CHAIN_ID_HEX,
  chainName: 'Ritual Chain',
  nativeCurrency: { name: 'RITUAL', symbol: 'RITUAL', decimals: 18 },
  rpcUrls: ['https://rpc.ritualfoundation.org'],
  blockExplorerUrls: ['https://explorer.ritualfoundation.org'],
};

// Detect ethereum provider across different wallets
function getProvider(): any | null {
  if (typeof window === 'undefined') return null;
  // @ts-ignore
  const ethereum = window.ethereum;
  if (!ethereum) return null;
  // Some wallets inject multiple providers
  if (ethereum.providers?.length > 0) {
    // Find MetaMask or first available
    return ethereum.providers.find((p: any) => p.isMetaMask) || ethereum.providers[0];
  }
  return ethereum;
}

export function useWeb3() {
  const [account, setAccount] = useState<Address | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef<any>(null);

  const isOnRitual = chainId === 1979;

  // Create public client for reading
  const publicClient = createPublicClient({
    chain: ritualChain,
    transport: http(),
  });

  const switchToRitual = useCallback(async (): Promise<boolean> => {
    const eth = providerRef.current;
    if (!eth) return false;
    try {
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_ID_HEX }] });
      return true;
    } catch (switchErr: any) {
      if (switchErr.code === 4902 || switchErr.code === -32603) {
        try {
          await eth.request({ method: 'wallet_addEthereumChain', params: [RITUAL_CHAIN_PARAMS] });
          await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_ID_HEX }] });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }, []);

  const connect = useCallback(async (walletType: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const eth = getProvider();
      if (!eth) {
        setError(`Please install ${walletType === 'phantom' ? 'Phantom EVM' : walletType === 'okx' ? 'OKX Wallet' : walletType === 'rabby' ? 'Rabby' : 'MetaMask'} extension first`);
        setIsConnecting(false);
        return;
      }
      providerRef.current = eth;

      // 1. Request accounts
      let accounts: string[];
      try {
        accounts = await eth.request({ method: 'eth_requestAccounts' });
      } catch (err: any) {
        if (err.code === 4001) {
          setError('Connection rejected by user');
        } else {
          setError(`Account request failed: ${err.message || 'Unknown error'}`);
        }
        setIsConnecting(false);
        return;
      }

      if (!accounts || accounts.length === 0) {
        setError('No accounts found. Please unlock your wallet.');
        setIsConnecting(false);
        return;
      }

      const address = accounts[0] as Address;

      // 2. Get current chain
      let currentChainId: string;
      try {
        currentChainId = await eth.request({ method: 'eth_chainId' });
      } catch {
        setError('Failed to read chain ID from wallet');
        setIsConnecting(false);
        return;
      }
      setChainId(parseInt(currentChainId, 16));

      // 3. Switch to Ritual if needed
      if (parseInt(currentChainId, 16) !== 1979) {
        const switched = await switchToRitual();
        if (!switched) {
          setError('Failed to switch to Ritual Chain. Please add it manually: Chain ID 1979, RPC: https://rpc.ritualfoundation.org');
          setIsConnecting(false);
          return;
        }
        setChainId(1979);
      }

      setAccount(address);
      setIsConnected(true);
      localStorage.setItem('ritual_wallet_type', walletType);

    } catch (err: any) {
      setError(err?.message || 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [switchToRitual]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    providerRef.current = null;
    localStorage.removeItem('ritual_wallet_type');
  }, []);

  const readProfile = useCallback(async (address: Address): Promise<PlayerProfile | null> => {
    try {
      const result = await publicClient.readContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: 'players',
        args: [address],
      });
      return {
        username: result[0],
        characterId: 0,
        characterName: '',
        totalMatches: Number(result[1]),
        totalWins: Number(result[2]),
        totalStars: Number(result[3]),
        endlessHighScore: Number(result[4]),
        lastPlayedAt: Number(result[5]),
        exists: result[6],
      };
    } catch {
      return null;
    }
  }, []);

  // Listen for chain/account changes
  useEffect(() => {
    const eth = getProvider();
    if (!eth) return;

    const onAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnect();
      else { setAccount(accounts[0] as Address); setIsConnected(true); }
    };
    const onChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
    };
    const onDisconnect = () => disconnect();

    eth.on('accountsChanged', onAccountsChanged);
    eth.on('chainChanged', onChainChanged);
    eth.on('disconnect', onDisconnect);

    return () => {
      eth.removeListener('accountsChanged', onAccountsChanged);
      eth.removeListener('chainChanged', onChainChanged);
      eth.removeListener('disconnect', onDisconnect);
    };
  }, [disconnect]);

  // Auto-reconnect on mount
  useEffect(() => {
    const saved = localStorage.getItem('ritual_wallet_type');
    if (saved) {
      const eth = getProvider();
      if (eth) {
        eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
          if (accounts?.length > 0) {
            setAccount(accounts[0] as Address);
            setIsConnected(true);
            eth.request({ method: 'eth_chainId' }).then((cid: string) => setChainId(parseInt(cid, 16)));
          }
        }).catch(() => {});
      }
    }
  }, []);

  const submitMatchResult = useCallback(async (
    _levelId: number, _playerScore: number, _aiScore: number,
    _starsEarned: number, _rallyLength: number, _aiPersonalityHash: string
  ) => {
    const eth = providerRef.current;
    if (!eth || !account) return;
    try {
      await eth.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: GAME_CONTRACT_ADDRESS,
          data: '0x', // Would encode actual function call
          value: '0x0',
        }],
      });
    } catch (err: any) {
      console.error('Submit failed:', err.message);
    }
  }, [account]);

  return { account, isConnected, isConnecting, isOnRitual, chainId, error, connect, disconnect, readProfile, submitMatchResult };
}
