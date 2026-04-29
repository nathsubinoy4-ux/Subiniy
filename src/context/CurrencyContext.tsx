import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CurrencyContextType {
  isUsdMode: boolean;
  setIsUsdMode: (value: boolean) => void;
  toggleUsdMode: () => void;
  convertBalance: (balance: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [isUsdMode, setIsUsdMode] = useState(false);

  const toggleUsdMode = () => setIsUsdMode((prev) => !prev);

  const convertBalance = (balance: number) => {
    if (isUsdMode) {
      return `$${(balance / 1000).toFixed(2)}`;
    }
    return balance.toLocaleString();
  };

  return (
    <CurrencyContext.Provider value={{ isUsdMode, setIsUsdMode, toggleUsdMode, convertBalance }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
