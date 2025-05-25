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
  
  const serviceAccount = {
    "type": "service_account",
    "project_id": "kenongo-task-e6a5a",
    "private_key_id": "3f122a4e10169bd6b68bdc6498a9651e66a191fd",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDsEQcG2PBItI9u\nfy4SUgr/buq+8gxlLZdpm40YfSOYoOVRw/iUMXGZMk7LP9AkkXTFcLCSb2HK+H4V\n1uzNRMOwuFiZFPy62loEOtF54FsiT4D0J1GGy7x1KbFfesE1E5MmDhqxB2I5bjql\nEa3sxjGjC6jSug1SIqJK3E7akp2WMZdck/a6CTD8h3Eim7rpy0nn1qM27u4AxeDf\nmBxuVnkfOqHOQK9/gHLfSzZ/5N9N0nJc/MWJ2Ek9bmqCeh4L4dgy4Ndp037zhDO1\nAL9i7z3ki2lc1EX04JtYo2/qoLsrGZcyxpm88ySTmJkEr561hS5mVplfMQEO633m\n9AjJI4mnAgMBAAECggEAbE7JpwocgHcbQaqnRC+RLS3CFVZvenJnAESmgUBU9x+G\n5zNfFvrycEPFI/qEsGpuJXI1CRKCT0Igczu3TNyKXkfOGnonFEG/QCaOWnklxwGs\nHBj4Djzmm+jDoRdsksIG5tRcybEmD0x0Kq0IW9R5DKH6VKiZGQCb7nXS1fSjybbY\nVJJoqj3DV4nKCWIy3pnsSoOMx010yO+1D+EpNy+9oAE79P+LNOfY3eCPJ3eEPGdP\n2sPFnoeoLL219cBA3aNVExp2vm5Gy8hZtV/hOuDbFnj7zGTho9/SviebFGQ9uM0Z\nzMV8NilQjlikn052d2ra9CWjV1kJIIxySJ1ffpuNPQKBgQD+BSvT3pxV03K0IsPk\n8Q+wjLnxzPTqh/zLHpAcyZqrPTbcBVTRdYkCFOrAXqM8vi6hv/dRVCWhSlJ/P/MV\neofFBYOuSLol6S13RvfhvseOnecGLhTlj+Hs+GNk8g2g+AhBVqB90GH1yU78H3mD\nddeAIs582GsKjjePUVqERKksswKBgQDt6AjVeRt+C7PkYQGDcIvc0PeNjOpnEGJJ\nykrew549yHuWxOcdZlZsa8Z6mXeDcYjMUUSSmyWmxo11Y70E4dcsB6FIGGBY9YEK\nqpSXNTWxz28rRd2SHiNmjHfmiBPrvAuFAKH6VM6HHKhjyfHkC7GyNKlQ0rslbjxQ\nLbl+sbQRPQKBgELMdVQHzDC9pAI+yijgQ3H378XoUdeC3zVC2j7XvTaeqFh/hmh2\ncgr8GSdxO5fzoyuh4ZWffS3G757K4E+boyxqYNBqC5mAkhY1sWXJ14xndaMoZxJf\nHdhFEU4wYOkdkH4uG5I6RChwQbcHR9sMGBl4DbjC6JMkBvRHPnhd3ecFAoGATN0o\n7X+haEnzpxfIW2UjawaA1NTwbrgWaWzYX7yoBaIefAnF+fO0fHcdu0KWIHuwDQM8\nunkx4v5HeePtkAQ/dtRIQXjOuC8pr/6I34mrfXVdn4eFHM5r9ZfwrSTN+t3YgvI/\nYxe/Wlvh88utQVad5Muq4JgVKvTAu87qHYrgeKkCgYB6EJL57K4JwFIfT/a4AT8A\nuhjo4/JSlP/3swMTfO3Dxvphw4Mg+3KynLbIhme5wAE6I+XwhZIb2569u/rjg5WX\nd42Gi0J2OhuWWaz0RWzGEdDJhsOWPdnvjdeqQX1JoKcDeJss4i/XINS9787vUFAz\n99QZR6OQCKFDzIrGaDswxQ==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@kenongo-task-e6a5a.iam.gserviceaccount.com",
    "client_id": "107894626371555546138",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40kenongo-task-e6a5a.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };

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
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebase: {
      projectId: "kenongo-task-e6a5a",
      clientEmail: "firebase-adminsdk-fbsvc@kenongo-task-e6a5a.iam.gserviceaccount.com",
      privateKeyExists: true
    }
  });
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
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    FIREBASE_PROJECT_ID: "kenongo-task-e6a5a",
    FIREBASE_CLIENT_EMAIL: "firebase-adminsdk-fbsvc@kenongo-task-e6a5a.iam.gserviceaccount.com",
    PRIVATE_KEY_EXISTS: true
  });
}); 
