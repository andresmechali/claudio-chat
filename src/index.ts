import Express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { sendMessage } from './utils';

dotenv.config();

const app = Express();
const port = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/webhook', function (req, res) {
  console.log(req.query);
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == process.env.VERIFY_TOKEN
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post('/webhook', async (request, response) => {
  console.log('Incoming webhook: ' + JSON.stringify(request.body));
  for (const entry of request.body.entry) {
    console.log({ entry });
    for (const change of entry?.changes) {
      const phoneNumberId = change.value.metadata.phone_number_id;
      console.log({ change });
      for (const message of change?.value?.messages) {
        console.log({ message });
        let { from, type } = message;
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
  response.sendStatus(200);
});

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`),
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
