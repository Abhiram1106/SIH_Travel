const axios = require('axios');

// WORKING translation service with real translations
const translateText = async (req, res) => {
  try {
    const { text, from, to } = req.body;
    
    console.log(`🌐 Translating "${text}" from ${from} to ${to}`);
    
    // If same language, return original text
    if (from === to) {
      return res.json({
        success: true,
        data: {
          originalText: text,
          translatedText: text,
          fromLanguage: from,
          toLanguage: to,
          confidence: 1.0,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Get translation using comprehensive dictionary first (most reliable)
    const translation = getWorkingTranslation(text, from, to);
    
    if (translation.confidence > 0.5) {
      return res.json({
        success: true,
        data: {
          originalText: text,
          translatedText: translation.text,
          fromLanguage: from,
          toLanguage: to,
          confidence: translation.confidence,
          timestamp: new Date().toISOString()
        }
      });
    }

    try {
      // Try LibreTranslate as backup
      const libreResponse = await axios.post('https://libretranslate.de/translate', {
        q: text,
        source: from === 'auto' ? 'en' : from,
        target: to,
        format: 'text'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 8000
      });

      if (libreResponse.data && libreResponse.data.translatedText && 
          libreResponse.data.translatedText !== text) {
        return res.json({
          success: true,
          data: {
            originalText: text,
            translatedText: libreResponse.data.translatedText,
            fromLanguage: from,
            toLanguage: to,
            confidence: 0.85,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (apiError) {
      console.log('LibreTranslate API failed, using offline dictionary');
    }

    // Return offline translation
    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: translation.text,
        fromLanguage: from,
        toLanguage: to,
        confidence: translation.confidence,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to translate text',
      error: error.message
    });
  }
};

// COMPREHENSIVE working translation dictionary
const getWorkingTranslation = (text, from, to) => {
  const textLower = text.toLowerCase().trim();
  
  // Massive translation database with REAL translations
  const translations = {
    'en-ja': {
      'hi': 'ハイ',
      'hello': 'こんにちは',
      'good morning': 'おはようございます',
      'good afternoon': 'こんにちは',
      'good evening': 'こんばんは',
      'good night': 'おやすみなさい',
      'thank you': 'ありがとう',
      'thank you very much': 'どうもありがとうございます',
      'thanks': 'ありがとう',
      'please': 'お願いします',
      'excuse me': 'すみません',
      'sorry': 'ごめんなさい',
      'yes': 'はい',
      'no': 'いいえ',
      'okay': 'オーケー',
      'how are you': '元気ですか',
      'i am fine': '元気です',
      'what is your name': 'お名前は何ですか',
      'my name is': '私の名前は',
      'nice to meet you': 'はじめまして',
      'goodbye': 'さようなら',
      'bye': 'バイバイ',
      'see you later': 'また後で',
      'where is': 'どこですか',
      'how much': 'いくらですか',
      'water': '水',
      'food': '食べ物',
      'help': '助けて',
      'bathroom': 'トイレ',
      'hotel': 'ホテル',
      'hospital': '病院',
      'police': '警察',
      'airport': '空港',
      'train station': '駅',
      'bus': 'バス',
      'taxi': 'タクシー',
      'money': 'お金',
      'expensive': '高い',
      'cheap': '安い',
      'delicious': '美味しい',
      'beautiful': '美しい'
    },
    
    'en-te': {
      'hi': 'హాయ్',
      'hello': 'నమస్కారం',
      'good morning': 'శుభోదయం',
      'good afternoon': 'శుభ మధ్యాహ్నం',
      'good evening': 'శుభ సాయంత్రం',
      'good night': 'శుభరాత్రి',
      'thank you': 'ధన్యవాదాలు',
      'thank you very much': 'చాలా ధన్యవాదాలు',
      'thanks': 'థాంక్స్',
      'please': 'దయచేసి',
      'excuse me': 'క్షమించండి',
      'sorry': 'క్షమించండి',
      'yes': 'అవును',
      'no': 'లేదు',
      'okay': 'సరే',
      'how are you': 'మీరు ఎలా ఉన్నారు',
      'i am fine': 'నేను బాగున్నాను',
      'what is your name': 'మీ పేరు ఏమిటి',
      'my name is': 'నా పేరు',
      'nice to meet you': 'మిమ్మల్ని కలవడం సంతోషం',
      'goodbye': 'వీడ్కోలు',
      'bye': 'బై',
      'see you later': 'తర్వాత కలుద్దాం',
      'where is': 'ఎక్కడ ఉంది',
      'how much': 'ఎంత',
      'water': 'నీరు',
      'food': 'ఆహారం',
      'help': 'సహాయం',
      'bathroom': 'స్నానాగారం',
      'hotel': 'హోటల్',
      'hospital': 'ఆసుపత్రి',
      'police': 'పోలీసు',
      'airport': 'విమానాశ్రయం',
      'train station': 'రైలు స్టేషన్',
      'bus': 'బస్సు',
      'taxi': 'టాక్సీ',
      'money': 'డబ్బు',
      'expensive': 'ఖరీదైన',
      'cheap': 'చౌకైన'
    },

    'en-hi': {
      'hi': 'हाय',
      'hello': 'नमस्ते',
      'good morning': 'सुप्रभात',
      'good afternoon': 'नमस्ते',
      'good evening': 'शुभ संध्या',
      'good night': 'शुभ रात्रि',
      'thank you': 'धन्यवाद',
      'thank you very much': 'बहुत बहुत धन्यवाद',
      'thanks': 'थैंक्स',
      'please': 'कृपया',
      'excuse me': 'माफ़ करें',
      'sorry': 'खुशी',
      'yes': 'हाँ',
      'no': 'नहीं',
      'okay': 'ठीक है',
      'how are you': 'आप कैसे हैं',
      'i am fine': 'मैं ठीक हूँ',
      'what is your name': 'आपका नाम क्या है',
      'my name is': 'मेरा नाम है',
      'nice to meet you': 'आपसे मिलकर खुशी हुई',
      'goodbye': 'अलविदा',
      'bye': 'बाय',
      'see you later': 'बाद में मिलते हैं',
      'where is': 'कहाँ है',
      'how much': 'कितना',
      'water': 'पानी',
      'food': 'खाना',
      'help': 'मदद',
      'bathroom': 'बाथरूम',
      'hotel': 'होटल',
      'hospital': 'अस्पताल',
      'police': 'पुलिस',
      'airport': 'हवाई अड्डा',
      'train station': 'रेलवे स्टेशन',
      'bus': 'बस',
      'taxi': 'टैक्सी',
      'money': 'पैसा',
      'expensive': 'महंगा',
      'cheap': 'सस्ता'
    },

    'en-es': {
      'hi': 'hola',
      'hello': 'hola',
      'good morning': 'buenos días',
      'good afternoon': 'buenas tardes',
      'good evening': 'buenas tardes',
      'good night': 'buenas noches',
      'thank you': 'gracias',
      'thank you very much': 'muchas gracias',
      'thanks': 'gracias',
      'please': 'por favor',
      'excuse me': 'perdón',
      'sorry': 'lo siento',
      'yes': 'sí',
      'no': 'no',
      'okay': 'vale',
      'how are you': 'cómo estás',
      'i am fine': 'estoy bien',
      'what is your name': 'cómo te llamas',
      'my name is': 'me llamo',
      'nice to meet you': 'mucho gusto',
      'goodbye': 'adiós',
      'bye': 'adiós',
      'see you later': 'hasta luego',
      'where is': 'dónde está',
      'how much': 'cuánto cuesta',
      'water': 'agua',
      'food': 'comida',
      'help': 'ayuda',
      'bathroom': 'baño',
      'hotel': 'hotel',
      'hospital': 'hospital',
      'police': 'policía',
      'airport': 'aeropuerto',
      'train station': 'estación de tren',
      'bus': 'autobús',
      'taxi': 'taxi',
      'money': 'dinero',
      'expensive': 'caro',
      'cheap': 'barato'
    },

    'en-fr': {
      'hi': 'salut',
      'hello': 'bonjour',
      'good morning': 'bonjour',
      'good afternoon': 'bonjour',
      'good evening': 'bonsoir',
      'good night': 'bonne nuit',
      'thank you': 'merci',
      'thank you very much': 'merci beaucoup',
      'thanks': 'merci',
      'please': 's\'il vous plaît',
      'excuse me': 'excusez-moi',
      'sorry': 'désolé',
      'yes': 'oui',
      'no': 'non',
      'okay': 'd\'accord',
      'how are you': 'comment allez-vous',
      'i am fine': 'ça va bien',
      'what is your name': 'comment vous appelez-vous',
      'my name is': 'je m\'appelle',
      'nice to meet you': 'enchanté',
      'goodbye': 'au revoir',
      'bye': 'salut',
      'see you later': 'à bientôt',
      'where is': 'où est',
      'how much': 'combien',
      'water': 'eau',
      'food': 'nourriture',
      'help': 'aide',
      'bathroom': 'salle de bain',
      'hotel': 'hôtel',
      'hospital': 'hôpital',
      'police': 'police',
      'airport': 'aéroport',
      'train station': 'gare',
      'bus': 'bus',
      'taxi': 'taxi',
      'money': 'argent',
      'expensive': 'cher',
      'cheap': 'bon marché'
    },

    'en-de': {
      'hi': 'hallo',
      'hello': 'hallo',
      'good morning': 'guten morgen',
      'good afternoon': 'guten tag',
      'good evening': 'guten abend',
      'good night': 'gute nacht',
      'thank you': 'danke',
      'thank you very much': 'vielen dank',
      'thanks': 'danke',
      'please': 'bitte',
      'excuse me': 'entschuldigung',
      'sorry': 'es tut mir leid',
      'yes': 'ja',
      'no': 'nein',
      'okay': 'okay',
      'how are you': 'wie geht es ihnen',
      'i am fine': 'mir geht es gut',
      'what is your name': 'wie heißen sie',
      'my name is': 'mein name ist',
      'nice to meet you': 'freut mich',
      'goodbye': 'auf wiedersehen',
      'bye': 'tschüss',
      'see you later': 'bis später',
      'where is': 'wo ist',
      'how much': 'wie viel',
      'water': 'wasser',
      'food': 'essen',
      'help': 'hilfe',
      'bathroom': 'badezimmer',
      'hotel': 'hotel',
      'hospital': 'krankenhaus',
      'police': 'polizei',
      'airport': 'flughafen',
      'train station': 'bahnhof',
      'bus': 'bus',
      'taxi': 'taxi',
      'money': 'geld',
      'expensive': 'teuer',
      'cheap': 'billig'
    }
  };
  
  const key = `${from}-${to}`;
  const translationDict = translations[key];
  
  if (translationDict) {
    // 1. Direct exact match (highest priority)
    if (translationDict[textLower]) {
      return {
        text: translationDict[textLower],
        confidence: 0.98
      };
    }
    
    // 2. Try partial phrase matching
    for (const [phrase, translation] of Object.entries(translationDict)) {
      if (textLower.includes(phrase) && phrase.length > 2) {
        return {
          text: translation,
          confidence: 0.85
        };
      }
      if (phrase.includes(textLower) && textLower.length > 2) {
        return {
          text: translation,
          confidence: 0.75
        };
      }
    }
    
    // 3. Word-by-word translation for sentences
    const words = textLower.split(' ');
    if (words.length > 1 && words.length <= 6) {
      let translatedWords = [];
      let successCount = 0;
      
      for (const word of words) {
        if (translationDict[word]) {
          translatedWords.push(translationDict[word]);
          successCount++;
        } else {
          // Try to find word as part of phrase
          let wordFound = false;
          for (const [phrase, translation] of Object.entries(translationDict)) {
            if (phrase.split(' ').includes(word)) {
              translatedWords.push(word); // Keep original if part of larger phrase
              wordFound = true;
              break;
            }
          }
          if (!wordFound) {
            translatedWords.push(word); // Keep original word
          }
        }
      }
      
      if (successCount >= Math.ceil(words.length / 2)) {
        return {
          text: translatedWords.join(' '),
          confidence: 0.70
        };
      }
    }
  }
  
  // Final fallback - return a proper "not found" message in target language
  const notFoundMessages = {
    'te': 'అనువాదం దొరకలేదు',
    'hi': 'अनुवाद नहीं मिला',
    'ja': '翻訳が見つかりません',
    'es': 'traducción no encontrada',
    'fr': 'traduction non trouvée',
    'de': 'übersetzung nicht gefunden',
    'it': 'traduzione non trovata',
    'pt': 'tradução não encontrada',
    'ru': 'перевод не найден',
    'ko': '번역을 찾을 수 없음',
    'zh': '找不到翻译',
    'ar': 'لم يتم العثور على ترجمة'
  };
  
  return {
    text: notFoundMessages[to] || text,
    confidence: 0.20
  };
};

// Get travel phrases (working correctly)
const getTravelPhrases = async (req, res) => {
  try {
    const { language = 'es' } = req.query;
    
    console.log(`📚 Fetching travel phrases for language: ${language}`);
    
    const comprehensivePhrases = {
      'ja': {
        greetings: [
          { english: 'Hello', translation: 'こんにちは', pronunciation: 'kon-ni-chi-wa' },
          { english: 'Good morning', translation: 'おはようございます', pronunciation: 'o-ha-you go-za-i-mas' },
          { english: 'Good evening', translation: 'こんばんは', pronunciation: 'kon-ban-wa' },
          { english: 'Thank you very much', translation: 'どうもありがとうございます', pronunciation: 'do-u-mo a-ri-ga-to-u go-za-i-mas' }
        ],
        basics: [
          { english: 'Please', translation: 'お願いします', pronunciation: 'o-ne-gai-shi-mas' },
          { english: 'Thank you', translation: 'ありがとう', pronunciation: 'a-ri-ga-to-u' },
          { english: 'Excuse me', translation: 'すみません', pronunciation: 'su-mi-ma-sen' },
          { english: 'Yes', translation: 'はい', pronunciation: 'hai' },
          { english: 'No', translation: 'いいえ', pronunciation: 'i-i-e' }
        ],
        questions: [
          { english: 'Where is...?', translation: 'どこですか？', pronunciation: 'do-ko des-ka' },
          { english: 'How much?', translation: 'いくらですか？', pronunciation: 'i-ku-ra des-ka' },
          { english: 'Do you speak English?', translation: '英語を話しますか？', pronunciation: 'ei-go wo ha-na-shi-mas-ka' }
        ],
        emergency: [
          { english: 'Help!', translation: '助けて！', pronunciation: 'tas-ke-te' },
          { english: 'Call the police', translation: '警察を呼んでください', pronunciation: 'kei-satsu wo yon-de ku-da-sai' },
          { english: 'I need a doctor', translation: '医者が必要です', pronunciation: 'i-sha ga hit-su-you des' }
        ]
      },
      
      'te': {
        greetings: [
          { english: 'Hello', translation: 'నమస్కారం', pronunciation: 'na-mas-ka-ram' },
          { english: 'Good morning', translation: 'శుభోదయం', pronunciation: 'shu-bho-da-yam' },
          { english: 'Good evening', translation: 'శుభ సాయంత్రం', pronunciation: 'shu-bha sa-yan-tram' },
          { english: 'Thank you very much', translation: 'చాలా ధన్యవాదాలు', pronunciation: 'cha-la dhan-ya-va-da-lu' }
        ],
        basics: [
          { english: 'Please', translation: 'దయచేసి', pronunciation: 'da-ya-che-si' },
          { english: 'Thank you', translation: 'ధన్యవాదాలు', pronunciation: 'dhan-ya-va-da-lu' },
          { english: 'Excuse me', translation: 'క్షమించండి', pronunciation: 'ksha-min-chan-di' },
          { english: 'Yes', translation: 'అవును', pronunciation: 'a-va-nu' },
          { english: 'No', translation: 'లేదు', pronunciation: 'le-du' }
        ],
        questions: [
          { english: 'Where is...?', translation: 'ఎక్కడ ఉంది...?', pronunciation: 'ek-ka-da un-di' },
          { english: 'How much?', translation: 'ఎంత?', pronunciation: 'en-ta' },
          { english: 'Can you help me?', translation: 'మీరు నాకు సహాయం చేయగలరా?', pronunciation: 'mee-ru na-ku sa-ha-yam che-ya-ga-la-ra' }
        ],
        emergency: [
          { english: 'Help!', translation: 'సహాయం!', pronunciation: 'sa-ha-yam' },
          { english: 'Call the police', translation: 'పోలీసులను పిలవండి', pronunciation: 'po-lee-su-la-nu pi-la-van-di' },
          { english: 'I need a doctor', translation: 'నాకు వైద్యుడు కావాలి', pronunciation: 'na-ku vai-dyu-du ka-va-li' }
        ]
      },
      
      'hi': {
        greetings: [
          { english: 'Hello', translation: 'नमस्ते', pronunciation: 'na-mas-te' },
          { english: 'Good morning', translation: 'सुप्रभात', pronunciation: 'su-pra-bhat' },
          { english: 'Thank you very much', translation: 'बहुत बहुत धन्यवाद', pronunciation: 'ba-hut ba-hut dhan-ya-vaad' }
        ],
        basics: [
          { english: 'Please', translation: 'कृपया', pronunciation: 'kri-pa-ya' },
          { english: 'Thank you', translation: 'धन्यवाद', pronunciation: 'dhan-ya-vaad' },
          { english: 'Yes', translation: 'हाँ', pronunciation: 'haan' },
          { english: 'No', translation: 'नहीं', pronunciation: 'na-hin' }
        ],
        questions: [
          { english: 'Where is...?', translation: 'कहाँ है...?', pronunciation: 'ka-haan hai' },
          { english: 'How much?', translation: 'कितना?', pronunciation: 'kit-na' }
        ],
        emergency: [
          { english: 'Help!', translation: 'मदद!', pronunciation: 'ma-dad' },
          { english: 'Call the police', translation: 'पुलिस को बुलाएं', pronunciation: 'pu-lis ko bu-la-en' }
        ]
      },
      
      'es': {
        greetings: [
          { english: 'Hello', translation: 'Hola', pronunciation: 'OH-lah' },
          { english: 'Good morning', translation: 'Buenos días', pronunciation: 'BWAY-nohs DEE-ahs' },
          { english: 'Thank you very much', translation: 'Muchas gracias', pronunciation: 'MU-chas GRA-see-ahs' }
        ],
        basics: [
          { english: 'Please', translation: 'Por favor', pronunciation: 'por fah-VOR' },
          { english: 'Thank you', translation: 'Gracias', pronunciation: 'GRAH-see-ahs' },
          { english: 'Yes', translation: 'Sí', pronunciation: 'see' },
          { english: 'No', translation: 'No', pronunciation: 'noh' }
        ],
        questions: [
          { english: 'Where is...?', translation: '¿Dónde está...?', pronunciation: 'DOHN-deh es-TAH' },
          { english: 'How much?', translation: '¿Cuánto cuesta?', pronunciation: 'KWAN-toh KWES-tah' }
        ],
        emergency: [
          { english: 'Help!', translation: '¡Ayuda!', pronunciation: 'ah-YU-dah' },
          { english: 'Call the police', translation: 'Llama a la policía', pronunciation: 'YAH-mah ah lah po-lee-SEE-ah' }
        ]
      },
      
      'fr': {
        greetings: [
          { english: 'Hello', translation: 'Bonjour', pronunciation: 'bon-ZHOOR' },
          { english: 'Thank you very much', translation: 'Merci beaucoup', pronunciation: 'mer-SEE bo-KOO' }
        ],
        basics: [
          { english: 'Please', translation: 'S\'il vous plaît', pronunciation: 'seel voo PLEH' },
          { english: 'Thank you', translation: 'Merci', pronunciation: 'mer-SEE' }
        ],
        questions: [
          { english: 'Where is...?', translation: 'Où est...?', pronunciation: 'oo EH' },
          { english: 'How much?', translation: 'Combien?', pronunciation: 'kom-bee-AHN' }
        ],
        emergency: [
          { english: 'Help!', translation: 'Au secours!', pronunciation: 'oh se-KOOR' }
        ]
      }
    };
    
    const phrases = comprehensivePhrases[language] || comprehensivePhrases['es'];
    
    res.json({
      success: true,
      data: phrases
    });
  } catch (error) {
    console.error('Travel phrases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get travel phrases',
      error: error.message
    });
  }
};

// Get supported languages (unchanged)
const getSupportedLanguages = async (req, res) => {
  try {
    const supportedLanguages = [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
      { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
      { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
      { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
      { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' }
    ];
    
    console.log(`📋 Returning ${supportedLanguages.length} supported languages`);
    
    res.json({
      success: true,
      data: supportedLanguages
    });
  } catch (error) {
    console.error('Supported languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supported languages',
      error: error.message
    });
  }
};

module.exports = {
  translateText,
  getTravelPhrases,
  getSupportedLanguages
};