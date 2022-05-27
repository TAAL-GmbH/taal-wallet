import express from 'express';
import { credential, ServiceAccount } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import serviceAccount from './web3-wallet-test-firebase-adminsdk-760x6-8f7182b0d0.json';

const app = express();
app.use(express.json());

initializeApp({
  credential: credential.cert(serviceAccount as ServiceAccount),
});

app.get('/', async (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.post('/', async (req, res) => {
  const { title, body, data = {}, token } = req.body;

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value !== 'string') {
      data[key] = JSON.stringify(value);
    }
  });

  const message: Message = {
    notification: {
      title,
      body,
    },
    data,
    token,
  };

  try {
    const response = await getMessaging().send(message);
    res.json({
      success: true,
      response,
    });
  } catch (e) {
    console.error(e);
    res.json({
      success: false,
      error: e.message,
    });
  }
});

app.listen(3001, () =>
  console.log('Example app listening on port http://localhost:3001!')
);
