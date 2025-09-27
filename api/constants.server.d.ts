export const Role: {
  USER: 'user';
  AI: 'ai';
};

export type Role = (typeof Role)[keyof typeof Role];

export const Language: {
  ENGLISH: 'English';
  TIBETAN: 'བོད་མི (Tibetan)';
  HAWAIIAN: 'ʻŌlelo Hawaiʻi (Hawaiian)';
  TELUGU: 'తెలుగు (Telugu)';
};

export type Language = (typeof Language)[keyof typeof Language];

export const SYSTEM_PROMPTS: Record<Language, string>;
