export type Audio = {
  mime_type: string;
  sha256: string;
  id: string;
  voice: boolean;
};

export type Media = {
  url: string;
  mime_type: 'audio/ogg';
  sha256: string;
  file_size: number;
  id: string;
  messaging_product: 'whatsapp';
};

type Message = {
  context?: {
    forwarded: boolean;
  };
  from: string;
  id: string;
  timestamp: string;
  type: 'audio' | 'text';
  audio?: Audio;
  text?: {
    body: string;
  };
};

export type Contact = {
  profile: {
    name: string;
  };
  wa_id: string;
};

type Change = {
  value: {
    messaging_product: 'whatsapp';
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts: Contact[];
    messages: Message[];
  };
  field: 'messages';
};

type Entry = {
  id: string;
  changes: Change[];
};

export type Event = {
  object: 'whatsapp_business_account';
  entry: Entry[];
};

export type User = {
  id: string;
  audioBytes: number;
  audioCount: number;
  audioSeconds: number;
  country: string;
  isFree: boolean;
  isPremium: boolean;
  language: string;
  lastPaid: string | null;
  lastUpdated: string | null;
  name: string;
  phoneNumber: string;
  phoneNumberOriginal: string;
  created: string;
  tokensUsed: number;
  timesUsed: number;
};

export type TextMessage = {
  id: string;
  timestamp: string;
  text: string;
  response: string;
  tokensUsed: number;
};

export type AudioMessage = {
  id: string;
  timestamp: string;
  forwarded: boolean;
  mimeType: string;
  url: string;
  bytes: number;
  tokensUsed: number;
};
