import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://currency-conv-be.onrender.com/api';

export default function CurrencyConverter() {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [conversionHistory, setConversionHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [useHistorical, setUseHistorical] = useState(false);

  useEffect(() => {
    fetchCurrencies();
    loadHistory();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setLoadingCurrencies(true);
      const response = await fetch(`${API_BASE_URL}/currencies`);
      const data = await response.json();
      const currencyList = Object.keys(data.data);
      setCurrencies(currencyList);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      alert('Failed to load currencies. Please check if backend is running.');
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const loadHistory = () => {
    const stored = localStorage.getItem('conversionHistory');
    if (stored) {
      setConversionHistory(JSON.parse(stored));
    }
  };

  const saveToHistory = (conversion) => {
    const updated = [conversion, ...conversionHistory].slice(0, 20);
    setConversionHistory(updated);
    localStorage.setItem('conversionHistory', JSON.stringify(updated));
  };

  const handleConvert = async () => {
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      let response;

      if (useHistorical && selectedDate) {
        response = await fetch(
          `${API_BASE_URL}/currencies/historical?date=${selectedDate}&base_currency=${fromCurrency}&currencies=${toCurrency}`
        );
      } else {
        response = await fetch(
          `${API_BASE_URL}/currencies/latest?base_currency=${fromCurrency}&currencies=${toCurrency}`
        );
      }

      const data = await response.json();
      const rate = data.data[toCurrency];
      const convertedAmount = (amount * rate).toFixed(2);

      setResult(convertedAmount);

      const conversion = {
        id: Date.now(),
        from: fromCurrency,
        to: toCurrency,
        amount: parseFloat(amount),
        result: parseFloat(convertedAmount),
        rate: rate,
        date: new Date().toISOString(),
        historicalDate: useHistorical ? selectedDate : null
      };

      saveToHistory(conversion);
    } catch (error) {
      console.error('Error converting currency:', error);
      alert('Failed to convert currency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setConversionHistory([]);
    localStorage.removeItem('conversionHistory');
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingCurrencies) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-400 mx-auto"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <span className="text-4xl">💱</span>
            </div>
          </div>
          <p className="text-white text-lg mt-6 font-medium animate-pulse">Loading currencies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in w-full">
          <div className="flex justify-center w-full">
            <div className="text-7xl mb-4 animate-bounce-slow">💱</div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
              Currency Converter
            </h1>
          </div>

          <p className="text-blue-200 text-lg md:text-xl font-light">
            Real-time exchange rates at your fingertips
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white border-opacity-20">
              <div className="mb-6">
                <label className="block text-white text-sm font-bold mb-3 uppercase tracking-wide">
                  Amount
                </label>
                <input
                  type="number"
                  className="w-full px-6 py-4 text-2xl font-bold bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-transparent transition-all"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6 relative">
                <div>
                  <label className="block text-white text-sm font-bold mb-3 uppercase tracking-wide">
                    From
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-6 py-4 text-xl font-semibold bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                    >
                      {currencies.map((currency) => (
                        <option key={currency} value={currency} className="bg-gray-800">
                          {currency}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <button
                    onClick={swapCurrencies}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-2xl transform hover:scale-110 hover:rotate-180 transition-all duration-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                  </button>
                </div>

                <div>
                  <label className="block text-white text-sm font-bold mb-3 uppercase tracking-wide">
                    To
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-6 py-4 text-xl font-semibold bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                    >
                      {currencies.map((currency) => (
                        <option key={currency} value={currency} className="bg-gray-800">
                          {currency}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:hidden flex justify-center mb-6">
                <button
                  onClick={swapCurrencies}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                >
                  <span className="mr-2">⇅</span> Swap Currencies
                </button>
              </div>

              <div className="mb-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="historicalCheck"
                    className="w-5 h-5 text-purple-600 bg-white bg-opacity-20 border-white rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                    checked={useHistorical}
                    onChange={(e) => setUseHistorical(e.target.checked)}
                  />
                  <label htmlFor="historicalCheck" className="ml-3 text-white font-semibold cursor-pointer">
                    📅 Use historical exchange rate
                  </label>
                </div>
                {useHistorical && (
                  <input
                    type="date"
                    className="w-full px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 rounded-xl text-white focus:outline-none focus:ring-4 focus:ring-purple-400 transition-all"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                )}
              </div>

              <button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-6 text-xl"
                onClick={handleConvert}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Converting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🚀</span> Convert Currency
                  </span>
                )}
              </button>

              {/* Result */}
              {result !== null && (
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 text-center transform animate-scale-in shadow-2xl">
                  <p className="text-white text-sm font-semibold mb-2 uppercase tracking-wide">Result</p>
                  <h4 className="text-4xl md:text-5xl font-black text-white">
                    {amount} {fromCurrency}
                  </h4>
                  <div className="text-3xl my-3">⬇️</div>
                  <h4 className="text-4xl md:text-5xl font-black text-white">
                    {result} {toCurrency}
                  </h4>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white border-opacity-20 sticky top-8">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex justify-between items-center">
                <h5 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">📊</span> History
                </h5>
                {conversionHistory.length > 0 && (
                  <button
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105"
                    onClick={clearHistory}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {conversionHistory.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-6xl mb-4 opacity-50">📝</div>
                    <p className="text-blue-200 font-medium">No conversions yet</p>
                    <p className="text-blue-300 text-sm mt-2">Start converting to see your history</p>
                  </div>
                ) : (
                  conversionHistory.map((item, index) => (
                    <div
                      key={item.id}
                      className={`px-6 py-4 ${index !== conversionHistory.length - 1 ? 'border-b border-white border-opacity-10' : ''} hover:bg-white hover:bg-opacity-5 transition-all`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="font-bold text-white text-lg mb-1">
                            {item.amount} {item.from} → {item.result} {item.to}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-blue-200 text-xs bg-white bg-opacity-10 px-2 py-1 rounded-full">
                              Rate: {item.rate.toFixed(4)}
                            </span>
                            {item.historicalDate && (
                              <span className="bg-purple-500 bg-opacity-50 text-white text-xs px-2 py-1 rounded-full font-medium">
                                📅 {item.historicalDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-blue-300 text-xs whitespace-nowrap">
                          {formatDateTime(item.date)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}