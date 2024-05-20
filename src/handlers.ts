import { handleText, sendMessage } from './utils';

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
            // TODO: check
            //
          }

          try {
            const res = await sendMessage(
              phoneNumberId,
              from,
              'Hello from Claudio!',
            );
            console.log('res');
            console.log(res);
          } catch (err) {
            console.log('error');
            console.log(err);
          }
        }
      }
    }
  }
}
