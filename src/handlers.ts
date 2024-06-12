import axios from 'axios';
import dotenv from 'dotenv';
import {
  audioToText,
  responseToFile,
  sendMessage,
  textToCompletion,
} from './utils';
import { Audio, Media, Event, Contact } from './types';
import { getOrCreateUser, updateTokensUsed } from './firebase';

dotenv.config();

console.log({ dotenv });

async function checkIfAllowed(from: Contact, type: 'text' | 'audio') {
  const user = await getOrCreateUser(from.wa_id, from.profile.name);
  if (!user) {
    throw new Error('Error getting user');
  }
  let isAllowed = user.isFree || user.isPremium || user.tokensUsed <= 1000;
  if (!isAllowed) {
    await sendMessage(
      from.wa_id,
      'No tenés más tokens disponibles. Podés obtener más tokens en https://www.LINK.com',
    );
  }

  return isAllowed;
}

export async function handleText(from: Contact, text: string) {
  // Make sure user has permissions
  const isAllowed = checkIfAllowed(from, 'text');
  if (!isAllowed) {
    return;
  }

  const completion = await textToCompletion(text);
  const response =
    completion.choices[0].message.content || 'Hubo un error con tu mensaje.';
  await sendMessage(from.wa_id, response);

  const tokensUsed = completion.usage?.total_tokens || 0;

  await updateTokensUsed(from.wa_id, tokensUsed);
}

export async function handleAudio(
  from: Contact,
  phoneNumberId: string,
  audio: Audio,
  forwarded: boolean,
) {
  // Make sure user has permissions
  const isAllowed = checkIfAllowed(from, 'audio');
  if (!isAllowed) {
    return;
  }

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

    let tokensUsed = 0;

    if (responseAudio.data) {
      const file = await responseToFile(responseAudio, mime_type);

      const text = await audioToText(file);

      tokensUsed += Math.floor(text.length / 4); // Approximate

      if (forwarded) {
        // Send original audio as text
        await sendMessage(from.wa_id, text);
        // If message is long, get main points
        if (text.length > 100) {
          // TODO: set longer threshold
          const completion = await textToCompletion(
            `Necesito que me resumas el siguiente texto, y que me respondas solo con el resumen directamente. Hacelo lo mas corto posible, y escrito como si lo hubiera escrito la misma persona que el texto original. Este es el texto: ${text}`,
          );
          const shortText =
            completion.choices[0].message.content ||
            'Hubo un error con tu mensaje.';

          if (completion.choices[0].message.content) {
            tokensUsed += Math.floor(
              completion.choices[0].message.content.length / 4,
            ); // Approximate
            await sendMessage(from.wa_id, `Resumen: ${shortText}`);
          }
        }

        await updateTokensUsed(from.wa_id, tokensUsed, true);
      } else {
        await handleText(from, text);
      }
    }
  } catch (err) {
    console.log({ err });
  }
  return undefined;
}

export async function handleWebhook(body: Event) {
  try {
    for (const entry of body.entry) {
      for (const change of entry?.changes) {
        const phoneNumberId = change.value.metadata.phone_number_id;
        const contacts = change.value.contacts;
        const from = contacts?.[0];
        if (from && change?.value?.messages) {
          for (const message of change.value.messages) {
            const { type, text, audio, context } = message;

            if (type === 'text' && text) {
              await handleText(from, text.body);
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
  } catch (err) {
    console.log({ err });
    // TODO
  }
}
