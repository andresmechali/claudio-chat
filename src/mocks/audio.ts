const body = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '114680221643215',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '15550141561',
              phone_number_id: '107017232415075',
            },
            contacts: [
              { profile: { name: 'Andrés Mechali' }, wa_id: '5491170981111' },
            ],
            messages: [
              {
                from: '5491170981111',
                id: 'wamid.HBgNNTQ5MTE3MDk4MTExMRUCABIYFDNBMTVCOTIzMUE4NEIxRjgzRDgwAA==',
                timestamp: '1716590644',
                type: 'audio',
                audio: {
                  mime_type: 'audio/ogg; codecs=opus',
                  sha256: 'PT/BM7YfuGwbb+mA/QpqcuSqh3oTUeU20jHdFGPh5bQ=',
                  id: '831625122348112',
                  voice: true,
                },
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

export default body;
