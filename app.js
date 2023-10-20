import express, { json } from "express";
import { config } from 'dotenv';
import got from 'got';
import fs from 'fs';

config();

const PORT = process.env.PORT || 3000;

const server = express();

server.use(json());

server.get('/', (req, res) => {
  res.send(
    `Write your query or send request on this server.\n
    Main end points are /products, /phones.\n
    Also, you can fetch an image. You can find all the URLs in database`,
  );
});

server.post('/auth', (req, res) => {
  const { phone_number } = req.body;

  const raw = JSON.stringify({
    'phone_number': phone_number,
    'options': {
      'number_length': null,
      'send_result': true,
      'callback_url': 'https://product-catalog-be-s8k7.onrender.com/phoneConfirmed',
      'callback_key': null,
    },
  });

  let result;

  try {
    result = got.post('https://call2fa.rikkicom.net/call_api/call', {
      headers: {
        'Authorization': 'Bearer 770fd644f280e853573c9351617694c01412',
        'Content-Type': 'application/json'
      },
      body: raw,
      responseType: 'json'
    });
    
    res.status(200);
    res.send(result);
  } catch (err) {
    res.sendStatus(400);
  }
});

server.post('/phoneConfirmed', async(req, res) => {
  const rawData = fs.readFileSync('clientBase.json', 'utf-8');
  const jsonData = JSON.parse(rawData);

  jsonData.clients.push(req.body);

  const jsonNewData = JSON.stringify(jsonData);

  fs.writeFileSync(jsonNewData, 'clientBase.json');
});

server.post('/phoneCheck', (req, res) => {
  const { call_id } = req.body;

  const rawData = fs.readFileSync('clientBase.json', 'utf-8');
  const jsonData = JSON.parse(rawData);
  let checker = false;

  for (const elem of jsonData.clients) {
    if (elem.call_id === call_id) {
      checker = true;
    }
  }

  if (checker) {
    res.status(200);

    res.send({
      message: 'ok',
    });
  } else {
    res.sendStatus(403);
  }
});

server.listen(PORT, () => {
  console.log('Server is running');
});
