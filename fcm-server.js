const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS with specific options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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

// Health check endpoint
app.get('/', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'FCM Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Send FCM notification endpoint
app.post('/send-fcm', async (req, res) => {
  try {
    console.log('Received FCM request:', JSON.stringify(req.body, null, 2));
    const { token, title, body, data } = req.body;

    if (!token || !title || !body) {
      console.error('Missing required fields:', { token, title, body });
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { token, title, body }
      });
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
    };

    console.log('Sending FCM message:', JSON.stringify(message, null, 2));
    const response = await admin.messaging().send(message);
    console.log('FCM sent successfully:', response);
    res.json({ 
      success: true, 
      messageId: response,
      message: 'Notification sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending FCM:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FCM Server listening on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
}); 
