export const sendMessage = async (
  phoneNumberId: string,
  to: string,
  text: string,
) => {
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
          to,
          text: { body: text },
        }),
      },
    );
  } catch (err) {
    console.log('Error sending message:', err);
    throw err;
  }
};
