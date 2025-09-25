import React, { useState, useEffect } from 'react';
import Button from './Button';
import InputField from './InputField';
import { apiService } from '../services/apiService';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface TranslationResult {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  confidence: number;
  timestamp: string;
}

interface TravelPhrases {
  greetings: Phrase[];
  basics: Phrase[];
  questions: Phrase[];
  emergency: Phrase[];
}

interface Phrase {
  english: string;
  translation: string;
  pronunciation: string;
}

const LanguageTranslator: React.FC = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [fromLanguage, setFromLanguage] = useState('en');
  const [toLanguage, setToLanguage] = useState('es');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'translate' | 'phrases'>('translate');
  const [travelPhrases, setTravelPhrases] = useState<TravelPhrases | null>(null);
  const [phrasesLoading, setPhrasesLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [translationHistory, setTranslationHistory] = useState<TranslationResult[]>([]);

  useEffect(() => {
    fetchLanguages();
    loadTranslationHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'phrases') {
      fetchTravelPhrases();
    }
  }, [activeTab, toLanguage]);

  const fetchLanguages = async () => {
    try {
      const response = await apiService.get('/translator/languages');
      if (response.success && Array.isArray(response.data)) {
        setLanguages(response.data);
      } else {
        console.error('Invalid languages response:', response);
        setLanguages([]);
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  };

  const fetchTravelPhrases = async () => {
    setPhrasesLoading(true);
    try {
      const response = await apiService.get(`/translator/phrases?language=${toLanguage}`);
      if (
        response.success &&
        response.data &&
        typeof response.data === 'object' &&
        Array.isArray((response.data as any).greetings) &&
        Array.isArray((response.data as any).basics) &&
        Array.isArray((response.data as any).questions) &&
        Array.isArray((response.data as any).emergency)
      ) {
        setTravelPhrases(response.data as TravelPhrases);
      } else {
        console.error('Invalid phrases response:', response);
        setTravelPhrases(null);
      }
    } catch (error) {
      console.error('Failed to fetch travel phrases:', error);
      setTravelPhrases(null);
    } finally {
      setPhrasesLoading(false);
    }
  };

  const translateText = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const response = await apiService.post('/translator/translate', {
        text: inputText.trim(),
        from: fromLanguage,
        to: toLanguage
      });

      if (
        response.success &&
        response.data &&
        typeof response.data === 'object' &&
        'originalText' in response.data &&
        'translatedText' in response.data &&
        'fromLanguage' in response.data &&
        'toLanguage' in response.data &&
        'confidence' in response.data &&
        'timestamp' in response.data
      ) {
        const translationResult = response.data as TranslationResult;
        setResult(translationResult);
        
        // Add to history
        const newHistory = [translationResult, ...translationHistory.slice(0, 4)];
        setTranslationHistory(newHistory);
        saveTranslationHistory(newHistory);
      } else {
        console.error('Invalid translation response:', response);
        setResult(null);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    const temp = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(temp);
    setResult(null);
    
    // If there's input text and a result, swap them
    if (result) {
      setInputText(result.translatedText);
    }
  };

  // Enhanced voice synthesis with proper language codes
  const speakText = async (text: string, languageCode: string, identifier?: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in your browser');
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();
    
    if (isSpeaking === identifier) {
      setIsSpeaking(null);
      return;
    }

    setIsSpeaking(identifier || text);

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Map language codes to proper speech synthesis language codes
      const voiceLanguageMap: { [key: string]: string } = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'zh-tw': 'zh-TW',
        'ar': 'ar-SA',
        'hi': 'hi-IN',
        'te': 'te-IN',
        'ta': 'ta-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN',
        'bn': 'bn-IN',
        'gu': 'gu-IN',
        'mr': 'mr-IN',
        'pa': 'pa-IN',
        'ur': 'ur-PK',
        'th': 'th-TH',
        'vi': 'vi-VN',
        'tr': 'tr-TR',
        'nl': 'nl-NL',
        'sv': 'sv-SE',
        'da': 'da-DK',
        'no': 'nb-NO',
        'fi': 'fi-FI',
        'pl': 'pl-PL',
        'cs': 'cs-CZ',
        'hu': 'hu-HU',
        'ro': 'ro-RO',
        'bg': 'bg-BG',
        'hr': 'hr-HR',
        'sk': 'sk-SK',
        'sl': 'sl-SI',
        'et': 'et-EE',
        'lv': 'lv-LV',
        'lt': 'lt-LT',
        'he': 'he-IL',
        'fa': 'fa-IR',
        'sw': 'sw-KE',
        'af': 'af-ZA'
      };

      utterance.lang = voiceLanguageMap[languageCode] || 'en-US';
      
      // Try to find a native voice for the language
      const voices = speechSynthesis.getVoices();
      const nativeVoice = voices.find(voice => 
        voice.lang.toLowerCase().startsWith(languageCode.toLowerCase()) ||
        voice.lang.toLowerCase().startsWith(voiceLanguageMap[languageCode]?.toLowerCase() || '')
      );
      
      if (nativeVoice) {
        utterance.voice = nativeVoice;
      }

      // Adjust speech parameters for better clarity
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onend = () => {
        setIsSpeaking(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(null);
        console.error('Speech synthesis error');
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      setIsSpeaking(null);
    }
  };

  const loadTranslationHistory = () => {
    try {
      const stored = localStorage.getItem('translationHistory');
      if (stored) {
        setTranslationHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load translation history:', error);
    }
  };

  const saveTranslationHistory = (history: TranslationResult[]) => {
    try {
      localStorage.setItem('translationHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save translation history:', error);
    }
  };

  const clearHistory = () => {
    setTranslationHistory([]);
    localStorage.removeItem('translationHistory');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Enhanced quick phrases with more variety
  const quickPhrases = [
    'Hello, how are you?',
    'Thank you very much',
    'Please help me',
    'Where is the bathroom?',
    'How much does this cost?',
    'Can you help me?',
    'I need a doctor',
    'Where is the nearest hospital?',
    'I am lost, can you help me?',
    'Do you speak English?',
    'I don\'t understand',
    'Can you repeat that?',
    'Where is the train station?',
    'How do I get to the airport?',
    'Is there WiFi here?',
    'What time is it?'
  ];

  const getLanguageName = (code: string) => {
    const language = languages.find(lang => lang.code === code);
    return language ? `${language.flag} ${language.nativeName}` : code;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="card p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
        🌍 Advanced Language Translator
        <span className="ml-3 text-sm font-normal text-gray-500">
          Real translations • Voice synthesis • 40+ languages
        </span>
      </h2>

      {/* Enhanced Tabs */}
      <div className="flex space-x-1 bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-xl mb-6">
        {[
          { id: 'translate', label: 'Smart Translator', icon: '🤖', desc: 'AI-powered translations' },
          { id: 'phrases', label: 'Travel Phrases', icon: '✈️', desc: 'Essential travel vocabulary' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-4 px-6 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-lg">{tab.icon}</span>
              <span className="font-semibold">{tab.label}</span>
              <span className="text-xs opacity-75">{tab.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Translation Tab */}
      {activeTab === 'translate' && (
        <div className="space-y-8">
          {/* Enhanced Language Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                🗣️ Translate from
              </label>
              <select
                value={fromLanguage}
                onChange={(e) => setFromLanguage(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                🎯 Translate to
              </label>
              <select
                value={toLanguage}
                onChange={(e) => setToLanguage(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enhanced Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapLanguages}
              className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 transition-all duration-200 transform hover:scale-110 border-2 border-white shadow-lg"
              title="Swap languages"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* Enhanced Input Text Area */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              ✍️ Enter text to translate
            </label>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste your text here... (supports emoji 😊, special characters, and long texts)"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors text-lg min-h-[140px]"
                maxLength={5000}
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-3">
                {inputText.trim() && (
                  <button
                    onClick={() => speakText(inputText, fromLanguage, 'input')}
                    className={`p-2 rounded-full transition-colors ${
                      isSpeaking === 'input' 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title={isSpeaking === 'input' ? 'Stop speaking' : 'Listen to original'}
                  >
                    {isSpeaking === 'input' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.586 17.414a2 2 0 002.828 0L12 14.828l2.586 2.586a2 2 0 002.828 0L20 14.828V21a1 1 0 01-1 1H5a1 1 0 01-1-1v-6.172l2.586 2.586z" />
                      </svg>
                    )}
                  </button>
                )}
                <span className={`text-sm ${inputText.length > 4500 ? 'text-red-500' : 'text-gray-400'}`}>
                  {inputText.length}/5000
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Phrases */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              ⚡ Quick Phrases - Click to use
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickPhrases.map((phrase, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(phrase)}
                  className="text-left text-sm p-3 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 rounded-lg border-2 border-gray-100 hover:border-blue-200 text-gray-700 transition-all duration-200 hover:shadow-md"
                >
                  <span className="font-medium">{phrase}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Translate Button */}
          <Button
            onClick={translateText}
            disabled={loading || !inputText.trim()}
            loading={loading}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Translating...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                🌍 Translate Text
              </span>
            )}
          </Button>

          {/* Enhanced Translation Result */}
          {result && (
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
              <div className="space-y-6">
                {/* Translation Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    ✨ Translation Result
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className={`text-sm font-bold ${getConfidenceColor(result.confidence)}`}>
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Translated Text */}
                <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-green-700 flex items-center">
                      🎯 {getLanguageName(toLanguage)}
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(result.translatedText)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Copy translation"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => speakText(result.translatedText, toLanguage, 'result')}
                        className={`p-2 rounded-full transition-colors ${
                          isSpeaking === 'result' 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={isSpeaking === 'result' ? 'Stop speaking' : 'Listen to translation'}
                      >
                        {isSpeaking === 'result' ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-900 text-lg leading-relaxed">{result.translatedText}</p>
                </div>

                {/* Original Text */}
                <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                    📝 {getLanguageName(fromLanguage)} (Original)
                  </h4>
                  <p className="text-gray-700 text-lg leading-relaxed">{result.originalText}</p>
                </div>

                {/* Translation Info */}
                <div className="text-xs text-gray-500 flex justify-between items-center">
                  <span>Translated on {new Date(result.timestamp).toLocaleString()}</span>
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {result.fromLanguage} → {result.toLanguage}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Translation History */}
          {translationHistory.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">📚 Recent Translations</h3>
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Clear History
                </button>
              </div>
              <div className="space-y-3">
                {translationHistory.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border hover:bg-gray-100 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{getLanguageName(item.fromLanguage)}</p>
                        <p className="text-gray-800">{item.originalText}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{getLanguageName(item.toLanguage)}</p>
                        <p className="text-gray-800">{item.translatedText}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Travel Phrases Tab */}
      {activeTab === 'phrases' && (
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              🗺️ Learn essential phrases in
            </label>
            <select
              value={toLanguage}
              onChange={(e) => setToLanguage(e.target.value)}
              className="max-w-md px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
            >
              {languages.filter(lang => lang.code !== 'en').map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          {phrasesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading travel phrases...</p>
            </div>
          ) : travelPhrases ? (
            <div className="space-y-8">
              {Object.entries(travelPhrases).map(([category, phrases]) => (
                <div key={category} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize flex items-center">
                    {category === 'greetings' && '👋 '}
                    {category === 'basics' && '📝 '}
                    {category === 'questions' && '❓ '}
                    {category === 'emergency' && '🚨 '}
                    <span className="text-2xl mr-3">
                      {category === 'greetings' && '👋'}
                      {category === 'basics' && '📝'}
                      {category === 'questions' && '❓'}
                      {category === 'emergency' && '🚨'}
                    </span>
                    {category.charAt(0).toUpperCase() + category.slice(1)} Phrases
                    <span className="ml-3 text-sm font-normal text-gray-500">
                      ({phrases.length} phrases)
                    </span>
                  </h3>
                  <div className="grid gap-4">
                    {phrases.map((phrase: Phrase, index: number) => (
                      <div key={index} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                        <div className="space-y-3">
                          {/* English */}
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900 text-lg">{phrase.english}</span>
                            <button
                              onClick={() => speakText(phrase.english, 'en', `${category}-${index}-en`)}
                              className={`p-2 rounded-full transition-colors ${
                                isSpeaking === `${category}-${index}-en`
                                  ? 'bg-red-500 text-white animate-pulse'
                                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                              title="Listen to English"
                            >
                              {isSpeaking === `${category}-${index}-en` ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072" />
                                </svg>
                              )}
                            </button>
                          </div>
                          
                          {/* Translation */}
                          <div className="flex justify-between items-center bg-blue-50 rounded-lg p-3">
                            <div className="flex-1">
                              <div className="text-blue-800 font-semibold text-xl mb-1">{phrase.translation}</div>
                              <div className="text-sm text-blue-600 italic">Pronunciation: {phrase.pronunciation}</div>
                            </div>
                            <button
                              onClick={() => speakText(phrase.translation, toLanguage, `${category}-${index}-${toLanguage}`)}
                              className={`p-2 rounded-full transition-colors ${
                                isSpeaking === `${category}-${index}-${toLanguage}`
                                  ? 'bg-red-500 text-white animate-pulse'
                                  : 'text-blue-400 hover:text-blue-600 hover:bg-blue-100'
                              }`}
                              title="Listen to translation"
                            >
                              {isSpeaking === `${category}-${index}-${toLanguage}` ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No phrases available</h3>
              <p className="text-gray-600">Travel phrases for this language are not available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Voice Features Notice */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 mt-8">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">🎤</div>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-2">Enhanced Voice Features</h4>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• Click speaker icons to hear pronunciations in native voices</p>
              <p>• Works best with Chrome, Safari, and Edge browsers</p>
              <p>• Supports 40+ languages with proper accent and intonation</p>
              <p>• Red pulsing icon means audio is playing - click again to stop</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <div className="text-2xl mb-2">🌍</div>
          <h3 className="font-semibold text-blue-900">Real Translations</h3>
          <p className="text-sm text-blue-700">Powered by advanced translation APIs</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl text-center">
          <div className="text-2xl mb-2">🗣️</div>
          <h3 className="font-semibold text-green-900">Native Voice</h3>
          <p className="text-sm text-green-700">Authentic pronunciation in 40+ languages</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl text-center">
          <div className="text-2xl mb-2">✈️</div>
          <h3 className="font-semibold text-purple-900">Travel Ready</h3>
          <p className="text-sm text-purple-700">Essential phrases for any destination</p>
        </div>
      </div>
    </div>
  );
};

export default LanguageTranslator;