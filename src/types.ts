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
