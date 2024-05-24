import OpenAI from 'openai';
import dotenv from 'dotenv';
import { AxiosResponse } from 'axios';

dotenv.config();

const openai = new OpenAI({
  organization: '',
  apiKey: process.env.OPEN_AI_API_KEY || '',
  defaultHeaders: {
    Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
  },
});

export const sendMessage = async (
  phoneNumberId: string,
  to: string,
  text: string,
) => {
  try {
    await fetch(
      'https://graph.facebook.com/v19.0/' + phoneNumberId + '/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to.replace('54911', '5411'),
          type: 'text',
          text: { body: text },
        }),
      },
    );
  } catch (err) {
    console.log('Error sending message:', err);
    throw err;
  }
};

export async function responseToFile(
  response: AxiosResponse<ArrayBuffer>,
  mime_type: string,
) {
  try {
    const arrayBuffer = response.data;
    const buffer = Buffer.from(arrayBuffer);
    return new File([buffer], 'audio.ogg', { type: mime_type });
  } catch (err) {
    throw err;
  }
}

export async function audioToText(file: File): Promise<string> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'es',
      // TODO: add prompt with previous audio, if recent. Also add common slang.
    });

    return transcription.text;
  } catch (err) {
    throw err;
  }
}
