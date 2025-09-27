
export enum Language {
  ENGLISH = 'English',
  TIBETAN = 'བོད་མི (Tibetan)',
  HAWAIIAN = 'ʻŌlelo Hawaiʻi (Hawaiian)',
  TELUGU = 'తెలుగు (Telugu)',
}

export enum Role {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  language: Language;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
}
