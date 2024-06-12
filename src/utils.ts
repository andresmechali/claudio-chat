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

const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

export const sendMessage = async (to: string, text: string) => {
  console.log({ sendMessage: { to, text } });
  console.log({
    url: 'https://graph.facebook.com/v19.0/' + phoneNumberId + '/messages',
    whatsappToken: process.env.WHATSAPP_TOKEN,
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace('54911', '5411'),
      type: 'text',
      text: { body: text },
    }),
  });
  try {
    const res = await fetch(
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
    console.log('fetched');
    const json = await res.json();
    console.log({ json });
    const resText = await res.text();
    console.log({ resText });
    console.log({ res });
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
      response_format: 'verbose_json',
      // prompt:
      //   'El audio es en tono informal, creado por un amigo argentino, asique puede incluir jerga local.',
      // TODO: add prompt with previous audio, if recent. Also add common slang.
    });

    // TODO: https://platform.openai.com/docs/tutorials/meeting-minutes

    console.log({ transcription });

    return transcription.text;
  } catch (err) {
    throw err;
  }
}

export async function textToCompletion(text: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: text,
            },
          ],
        },
      ],
    });

    return completion;
  } catch (err) {
    throw err;
  }
}
