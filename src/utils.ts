export const sendMessage = async (
  phoneNumberId: string,
  to: string,
  text: string,
) => {
  console.log(
    'API:',
    'https://graph.facebook.com/v19.0/' + phoneNumberId + '/messages',
  );
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

    return res;
  } catch (err) {
    console.log('Error sending message:', err);
    throw err;
  }
};
