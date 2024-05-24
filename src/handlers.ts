import axios from 'axios';
import {
  audioToText,
  responseToFile,
  sendMessage,
  textToCompletion,
} from './utils';
import { Audio, Media, Event, Contact } from './types';

export async function handleText(
  from: Contact,
  text: string,
  phoneNumberId: string,
) {
  const completion = await textToCompletion(text);
  const response = completion || 'Hubo un error con tu mensaje.';
  await sendMessage(phoneNumberId, from.wa_id, response);
}

export async function handleAudio(
  from: Contact,
  phoneNumberId: string,
  audio: Audio,
  forwarded: boolean,
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

      if (forwarded) {
        await sendMessage(phoneNumberId, from.wa_id, text);
      } else {
        await handleText(from, text, phoneNumberId);
      }
    }
  } catch (err) {
    console.log({ err });
  }
  return undefined;
}

export async function handleWebhook(body: Event) {
  for (const entry of body.entry) {
    for (const change of entry?.changes) {
      const phoneNumberId = change.value.metadata.phone_number_id;
      const contacts = change.value.contacts;
      const from = contacts?.[0];
      if (from && change?.value?.messages) {
        for (const message of change.value.messages) {
          let { type, text, audio, context } = message;

          if (type === 'text' && text) {
            await handleText(from, text.body, phoneNumberId);
          } else if (type === 'audio' && audio) {
            try {
              const isForwarded = !!context?.forwarded;
              await handleAudio(from, phoneNumberId, audio, isForwarded);
            } catch (err) {
              console.log({ err });
              // TODO
            }
          }
        }
      }
    }
  }
}
