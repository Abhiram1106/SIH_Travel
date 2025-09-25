import React, { useState, useEffect } from 'react';
import Button from './Button';
import InputField from './InputField';
import { apiService } from '../services/apiService';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface ConversionResult {
  from: string;
  to: string;
  originalAmount: number;
  exchangeRate: number;
  convertedAmount: number;
  lastUpdated: string;
}

const CurrencyConverter: React.FC = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('100');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCurrencies();
    fetchRates();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await apiService.get('/currency/popular');
      if (response.success && response.data) {
        setCurrencies(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      // Fallback currencies
      setCurrencies([
        { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
        { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
        { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' }
      ]);
    }
  };

  const fetchRates = async () => {
    try {
      const response: {
        success: boolean;
        data?: { rates: Record<string, number> };
      } = await apiService.get(`/currency/rates?base=${fromCurrency}`);
      if (response.success && response.data && response.data.rates) {
        setRates(response.data.rates);
      }
    } catch (error) {
      console.error('Failed to fetch rates:', error);
    }
  };

  const convertCurrency = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    try {
      const response = await apiService.get(
        `/currency/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
      );

      if (response.success && response.data) {
        setResult(response.data as ConversionResult);
      }
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setResult(null);
  };

  const quickAmounts = [10, 50, 100, 500, 1000];

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        💱 Currency Converter
        <span className="ml-2 text-sm font-normal text-gray-500">
          Live exchange rates
        </span>
      </h2>

      <div className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <InputField
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="text-lg"
          />
          <div className="flex gap-2 mt-2">
            {quickAmounts.map(quickAmount => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="input-field"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="input-field"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapCurrencies}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Swap currencies"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* Convert Button */}
        <Button
          onClick={convertCurrency}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          loading={loading}
          className="w-full"
        >
          Convert Currency
        </Button>

        {/* Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-800 mb-2">
                {currencies.find(c => c.code === result.to)?.symbol || result.to}{' '}
                {result.convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-green-600">
                {currencies.find(c => c.code === result.from)?.symbol || result.from}{result.originalAmount} = {' '}
                {currencies.find(c => c.code === result.to)?.symbol || result.to}{result.convertedAmount}
              </div>
              <div className="text-xs text-green-500 mt-2">
                Exchange rate: 1 {result.from} = {result.exchangeRate} {result.to}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(result.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Popular Rates */}
        {rates && Object.keys(rates).length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Popular Rates (1 {fromCurrency} =)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(rates).slice(0, 6).map(([currency, rate]) => (
                <div key={currency} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {currencies.find(c => c.code === currency)?.flag || ''} {currency}
                    </span>
                    <span className="text-primary-600 font-semibold">
                      {typeof rate === 'number' ? rate.toFixed(4) : rate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Travel Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Currency Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Notify your bank before traveling abroad</li>
            <li>• Use ATMs for better exchange rates</li>
            <li>• Keep some cash for small vendors</li>
            <li>• Consider digital wallets for convenience</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;   