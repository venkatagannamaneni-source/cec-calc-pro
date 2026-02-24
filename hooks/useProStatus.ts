// RevenueCat subscription check hook
import { useState, useEffect, createContext, useContext } from 'react';
import { Platform } from 'react-native';

interface ProStatusContext {
  isPro: boolean;
  isLoading: boolean;
}

const ProContext = createContext<ProStatusContext>({ isPro: false, isLoading: true });

export function useProStatus(): ProStatusContext {
  return useContext(ProContext);
}

export { ProContext };

export function useProStatusProvider(): ProStatusContext {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // RevenueCat integration — uncomment when API keys are configured
        // const Purchases = (await import('react-native-purchases')).default;
        // Purchases.configure({
        //   apiKey: Platform.OS === 'ios'
        //     ? 'appl_XXXXXXX'  // Replace with actual iOS API key
        //     : 'goog_XXXXXXX', // Replace with actual Android API key
        // });
        // const customerInfo = await Purchases.getCustomerInfo();
        // setIsPro(customerInfo.entitlements.active['pro'] !== undefined);

        // For development: default to free tier
        setIsPro(false);
      } catch {
        setIsPro(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  return { isPro, isLoading };
}
