// Credits and gamification hook
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { CreditTransaction, GameProgress } from '@/types';

export function useCredits() {
  const { userData } = useAuth();
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setCredits(userData.credits || 0);
      fetchTransactions();
      fetchGameProgress();
    }
  }, [userData]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/credits/transactions`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchGameProgress = async () => {
    try {
      const response = await fetch(`/api/gamification/progress`);
      if (response.ok) {
        const data = await response.json();
        setGameProgress(data);
      }
    } catch (error) {
      console.error('Error fetching game progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const spendCredits = async (amount: number, description: string) => {
    try {
      const response = await fetch('/api/credits/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description }),
      });
      
      if (response.ok) {
        setCredits(prev => prev - amount);
        await fetchTransactions();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error spending credits:', error);
      return false;
    }
  };

  return {
    credits,
    transactions,
    gameProgress,
    loading,
    spendCredits,
    refetch: () => {
      fetchTransactions();
      fetchGameProgress();
    },
  };
}
