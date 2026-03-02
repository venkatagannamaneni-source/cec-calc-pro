import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cec-calc-pro/preferences';

export interface UserPreferences {
  unitSystem: 'imperial' | 'metric';
  defaultMaterial: 'copper' | 'aluminum';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  unitSystem: 'imperial',
  defaultMaterial: 'copper',
};

interface UserPreferencesContextValue {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  isLoaded: boolean;
}

export const UserPreferencesContext = createContext<UserPreferencesContextValue>({
  preferences: DEFAULT_PREFERENCES,
  updatePreference: () => {},
  isLoaded: false,
});

export function useUserPreferences() {
  return useContext(UserPreferencesContext);
}

export function useUserPreferencesProvider(): UserPreferencesContextValue {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(raw) });
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences((prev) => {
        const updated = { ...prev, [key]: value };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  return { preferences, updatePreference, isLoaded };
}
