import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cec-calc-pro/history';
const MAX_ENTRIES = 50;

export interface CalculationHistoryEntry {
  id: string;
  calculatorId: string;
  timestamp: number;
  inputSummary: string;
  resultPreview: string;
}

interface CalculationHistoryContextValue {
  history: CalculationHistoryEntry[];
  addEntry: (entry: Omit<CalculationHistoryEntry, 'id' | 'timestamp'>) => void;
  getRecent: (count: number) => CalculationHistoryEntry[];
  clearAll: () => void;
  isLoaded: boolean;
}

export const CalculationHistoryContext = createContext<CalculationHistoryContextValue>({
  history: [],
  addEntry: () => {},
  getRecent: () => [],
  clearAll: () => {},
  isLoaded: false,
});

export function useCalculationHistory() {
  return useContext(CalculationHistoryContext);
}

export function useCalculationHistoryProvider(): CalculationHistoryContextValue {
  const [history, setHistory] = useState<CalculationHistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setHistory(JSON.parse(raw));
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  const persist = useCallback((entries: CalculationHistoryEntry[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, []);

  const addEntry = useCallback(
    (entry: Omit<CalculationHistoryEntry, 'id' | 'timestamp'>) => {
      setHistory((prev) => {
        const newEntry: CalculationHistoryEntry = {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
        };
        const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES);
        persist(updated);
        return updated;
      });
    },
    [persist],
  );

  const getRecent = useCallback(
    (count: number) => history.slice(0, count),
    [history],
  );

  const clearAll = useCallback(() => {
    setHistory([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addEntry, getRecent, clearAll, isLoaded };
}
