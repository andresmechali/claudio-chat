import { sendMessage } from './utils';

export async function handleText(
  from: string,
  text: string,
  phoneNumberId: string,
) {
  console.log({ from, text, phoneNumberId });
  return `response to '${text}'`;
}

export async function handleAudio(from: string, phoneNumberId: string) {
  return `response to some audio`;
}

export async function handleWebhook(body: any) {
  let response: string | undefined = undefined;

  for (const entry of body.entry) {
    for (const change of entry?.changes) {
      const phoneNumberId = change.value.metadata.phone_number_id;
      if (change?.value?.messages) {
        for (const message of change.value.messages) {
          let { from, type, text } = message;

          if (type === 'text') {
            response = await handleText(from, text.body, phoneNumberId);
          } else if (type === 'audio') {
            // TODO
            response = await handleAudio(from, phoneNumberId);
          }

          if (response) {
            try {
              await sendMessage(phoneNumberId, from, response);
            } catch (err) {
              console.log('error responding:');
              console.log(err);
            }
          } else {
            console.log('Nothing to respond');
          }
        }
      }
    }
  }
}
