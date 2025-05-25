const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('Starting FCM Server...');
console.log('Environment variables loaded:', {
  projectId: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not set',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set',
  clientId: process.env.FIREBASE_CLIENT_ID ? 'Set' : 'Not set',
  authUri: process.env.FIREBASE_AUTH_URI ? 'Set' : 'Not set',
  tokenUri: process.env.FIREBASE_TOKEN_URI ? 'Set' : 'Not set',
  authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ? 'Set' : 'Not set',
  clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL ? 'Set' : 'Not set'
});

try {
  // Initialize Firebase Admin with environment variables
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
      authUri: process.env.FIREBASE_AUTH_URI,
      tokenUri: process.env.FIREBASE_TOKEN_URI,
      authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL
    })
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

// Endpoint untuk mengecek server berjalan
app.get('/', (req, res) => {
  res.json({ status: 'FCM Server is running!' });
});

app.post('/send-fcm', async (req, res) => {
  try {
    const { token, title, body, data } = req.body;
    console.log('Received FCM request:', { token, title, body, data });

    if (!token || !title || !body) {
      console.error('Missing required fields:', { token, title, body });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
    };

    console.log('Sending FCM message:', message);
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 