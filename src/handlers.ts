import axios from 'axios';
import {
  audioToText,
  responseToFile,
  sendMessage,
  textToCompletion,
} from './utils';
import { Audio, Media } from './types';

export async function handleText(
  from: string,
  text: string,
  phoneNumberId: string,
) {
  console.log({ from, text, phoneNumberId });
  const completion = await textToCompletion(text);
  const response = completion || 'Hubo un error con tu mensaje.';
  await sendMessage(phoneNumberId, from, response);
}

export async function handleAudio(
  from: string,
  phoneNumberId: string,
  audio: Audio,
) {
  try {
    const responseMedia = await fetch(
      `https://graph.facebook.com/v19.0/${audio.id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        },
      },
    );

    const media = (await responseMedia.json()) as Media;

    const { url, mime_type } = media;

    const responseAudio = await axios.get<ArrayBuffer>(url, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': mime_type,
      },
      responseType: 'arraybuffer',
    });

    if (responseAudio.data) {
      const file = await responseToFile(responseAudio, mime_type);

      const text = await audioToText(file);

      console.log({ textInAudio: text });
      await sendMessage(phoneNumberId, from, text);
    }
  } catch (err) {
    console.log({ err });
  }
  return undefined;
}

export async function handleWebhook(body: any) {
  for (const entry of body.entry) {
    for (const change of entry?.changes) {
      const phoneNumberId = change.value.metadata.phone_number_id;
      if (change?.value?.messages) {
        for (const message of change.value.messages) {
          let { from, type, text } = message;

          if (type === 'text') {
            await handleText(from, text.body, phoneNumberId);
          } else if (type === 'audio') {
            try {
              const audio = message.audio as Audio;
              await handleAudio(from, phoneNumberId, audio);
            } catch (err) {
              // TODO
            }
          }
        }
      }
    }
  }
}
