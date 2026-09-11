export type ChatLanguage = {
  /** BCP-47 tag used for the browser SpeechRecognition API */
  code: string;
  /** Label shown in the language switcher */
  label: string;
};

export const CHAT_LANGUAGES: ChatLanguage[] = [
  { code: "auto", label: "Auto-detect" },
  { code: "en-US", label: "English" },
  { code: "hi-IN", label: "Hindi (हिन्दी)" },
  { code: "bn-IN", label: "Bengali (বাংলা)" },
  { code: "ta-IN", label: "Tamil (தமிழ்)" },
  { code: "te-IN", label: "Telugu (తెలుగు)" },
  { code: "mr-IN", label: "Marathi (मराठी)" },
  { code: "gu-IN", label: "Gujarati (ગુજરાતી)" },
  { code: "kn-IN", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml-IN", label: "Malayalam (മലയാളം)" },
  { code: "pa-IN", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "ur-IN", label: "Urdu (اردو)" },
  { code: "es-ES", label: "Spanish (Español)" },
  { code: "fr-FR", label: "French (Français)" },
  { code: "de-DE", label: "German (Deutsch)" },
  { code: "it-IT", label: "Italian (Italiano)" },
  { code: "pt-PT", label: "Portuguese (Português)" },
  { code: "nl-NL", label: "Dutch (Nederlands)" },
  { code: "ru-RU", label: "Russian (Русский)" },
];

export const DEFAULT_STT_FALLBACK = "en-US";
