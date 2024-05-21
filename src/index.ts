import Express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { handleWebhook } from './handlers';
import mockMessage from './mocks/message';

dotenv.config();

const app = Express();
const port = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/webhook', function (req, res) {
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
  await handleWebhook(request.body);
  response.sendStatus(200);
});

app.get('/test', async (request, response) => {
  await handleWebhook(mockMessage);
  response.sendStatus(200);
});

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`),
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
