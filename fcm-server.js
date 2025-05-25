const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize Firebase Admin
try {
  console.log('Initializing Firebase Admin...');
  
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error('Error parsing service account JSON:', error);
    throw new Error('Invalid service account JSON format');
  }

  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Invalid service account: missing required fields');
  }

  console.log('Service Account loaded:', {
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKeyExists: !!serviceAccount.private_key
  });

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/', (req, res) => {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      firebase: {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKeyExists: !!serviceAccount.private_key
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Send FCM notification endpoint
app.post('/send-fcm', async (req, res) => {
  try {
    const { token, title, body, data } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['token', 'title', 'body'],
        received: { token: !!token, title: !!title, body: !!body }
      });
    }

    console.log(`[${new Date().toISOString()}] Sending FCM to token: ${token}`);
    console.log('Message:', { title, body, data });

    const message = {
      notification: {
        title,
        body
      },
      data: data || {},
      token
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);

    res.json({
      success: true,
      messageId: response,
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
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      FIREBASE_PROJECT_ID: serviceAccount.project_id,
      FIREBASE_CLIENT_EMAIL: serviceAccount.client_email,
      PRIVATE_KEY_EXISTS: !!serviceAccount.private_key
    });
  } catch (error) {
    console.error('Error parsing service account:', error);
  }
}); 
