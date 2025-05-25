const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Ganti path ke serviceAccountKey Anda
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(bodyParser.json());

// Endpoint untuk mengecek server berjalan
app.get('/', (req, res) => {
  res.json({ status: 'FCM Server is running!' });
});

app.post('/send-fcm', async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'token, title, and body are required' });
  }

  const message = {
    notification: { title, body },
    data: data || {},
    token,
    android: {
      priority: 'high',
      notification: {
        channelId: 'task_notification_channel',
        priority: 'high',
        defaultSound: true,
        defaultVibrateTimings: true,
        defaultLightSettings: true,
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          contentAvailable: true,
        },
      },
    },
  };

  try {
    await admin.messaging().send(message);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending FCM:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FCM server running on port ${PORT}`);
}); 