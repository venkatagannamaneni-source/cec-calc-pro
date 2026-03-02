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
    function loadPreferences(): void {
      AsyncStorage.getItem(STORAGE_KEY)
        .then((raw) => {
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (typeof parsed === 'object' && parsed !== null) {
                const validated: UserPreferences = { ...DEFAULT_PREFERENCES };
                if (parsed.unitSystem === 'imperial' || parsed.unitSystem === 'metric') {
                  validated.unitSystem = parsed.unitSystem;
                }
                if (parsed.defaultMaterial === 'copper' || parsed.defaultMaterial === 'aluminum') {
                  validated.defaultMaterial = parsed.defaultMaterial;
                }
                setPreferences(validated);
              }
            } catch (e) {
              console.warn('Failed to parse user preferences:', e);
            }
          }
          setIsLoaded(true);
        })
        .catch((e) => {
          console.warn('Failed to load user preferences:', e);
          setIsLoaded(true);
        });
    }

    loadPreferences();
  }, []);

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences((prev) => {
        const updated = { ...prev, [key]: value };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch((e) => {
          console.warn('Failed to save user preference:', e);
        });
        return updated;
      });
    },
    [],
  );

  return { preferences, updatePreference, isLoaded };
}
