import { useState } from "react";

export type Currency = 'USD' | 'EUR' | 'GBP';

interface CurrencyOption {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Conversion rate from USD (base currency)
}

const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 }, // Base currency from Airbnb
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 }, // 1 USD = 0.92 EUR (approximate)
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 }, // 1 USD = 0.79 GBP (approximate)
];

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  className?: string;
}

export function CurrencySelector({ selectedCurrency, onCurrencyChange, className = "" }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCurrencyData = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

  const handleSelect = (currency: Currency) => {
    onCurrencyChange(currency);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className="text-lg">{selectedCurrencyData.symbol}</span>
        <span className="font-medium">{selectedCurrencyData.code}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-1">
            {CURRENCIES.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleSelect(currency.code)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                  currency.code === selectedCurrency ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currency.symbol}</span>
                  <span>{currency.name}</span>
                </div>
                <span className="text-xs text-gray-500">{currency.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Currency conversion utilities
export function convertPrice(priceInEur: number, toCurrency: Currency): number {
  const currency = CURRENCIES.find(c => c.code === toCurrency);
  if (!currency) return priceInEur;
  return priceInEur * currency.rate;
}

export function formatPrice(price: number, currency: Currency): string {
  const currencyData = CURRENCIES.find(c => c.code === currency);
  if (!currencyData) return `${price.toFixed(2)}`;
  
  const convertedPrice = convertPrice(price, currency);
  
  // Format based on currency
  switch (currency) {
    case 'USD':
      return `$${convertedPrice.toFixed(2)}`;
    case 'EUR':
      return `€${convertedPrice.toFixed(2).replace('.', ',')}`;
    case 'GBP':
      return `£${convertedPrice.toFixed(2)}`;
    default:
      return `${convertedPrice.toFixed(2)}`;
  }
}

// Hook for managing currency state
export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('USD'); // Default to USD (Airbnb base currency)

  // Load saved currency from localStorage on mount
  useState(() => {
    const saved = localStorage.getItem('selectedCurrency');
    if (saved && ['USD', 'EUR', 'GBP'].includes(saved as Currency)) {
      setCurrency(saved as Currency);
    }
  });

  // Save currency to localStorage when it changes
  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency);
  };

  return {
    currency,
    setCurrency: handleCurrencyChange,
    convertPrice: (price: number) => convertPrice(price, currency),
    formatPrice: (price: number) => formatPrice(price, currency)
  };
}
