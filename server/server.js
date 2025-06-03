// require('dotenv').config();
// const express = require('express');
// const axios = require('axios');
// const admin = require('firebase-admin');
// const path = require('path');

// const app = express();
// app.use(express.static(path.join(__dirname, '../public')));

// const serviceAccount = require('./aria-22507-firebase-adminsdk-fbsvc-e53d8f0586.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// // Spotify OAuth callback
// app.get('/callback', async (req, res) => {
//   const code = req.query.code;
//   if (!code) {
//     return res.status(400).send('No code provided');
//   }

//   try {
//     const tokenResponse = await axios.post('https://accounts.spotify.com/api/token',
//       new URLSearchParams({
//         grant_type: 'authorization_code',
//         code: code,
//         redirect_uri: process.env.REDIRECT_URI,
//         client_id: process.env.SPOTIFY_CLIENT_ID,
//         client_secret: process.env.SPOTIFY_CLIENT_SECRET
//       }).toString(),
//       { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
//     );

//     const { access_token } = tokenResponse.data;
//     res.redirect(`/home.html?access_token=${access_token}`);
//   } catch (err) {
//     console.error('Error details:', {
//       message: err.message,
//       response: err.response?.data,
//       config: err.config
//     });
//     console.error('Error fetching token:', err.response?.data || err.message);
//     res.status(500).send('Authentication failed');
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs'); // Ditambahkan untuk debugging

const app = express();

// Konfigurasi static files
const rootDir = path.join(__dirname, '..');
console.log('Root directory:', rootDir);

// Cek file di root directory (untuk debugging)
try {
  const rootFiles = fs.readdirSync(rootDir);
  console.log('Files in root directory:', rootFiles);
} catch (err) {
  console.error('Error reading root directory:', err);
}

// Setup static files
app.use(express.static(rootDir)); // Serve semua file di root
app.use(express.static(path.join(rootDir, 'public'))); // Serve file di folder public

// Inisialisasi Firebase
const serviceAccount = require('./aria-22507-firebase-adminsdk-fbsvc-e53d8f0586.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Routes untuk halaman HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'login.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(rootDir, 'login.html'));
});

app.get('/home.html', (req, res) => {
  res.sendFile(path.join(rootDir, 'home.html'));
});

// Spotify OAuth callback
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.REDIRECT_URI || 'https://aria-pearl.vercel.app/callback',
        client_id: process.env.SPOTIFY_CLIENT_ID || 'c5e755c767534c6f93b729a953917a64',
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token } = tokenResponse.data;
    res.redirect(`/home.html?access_token=${access_token}`);
  } catch (err) {
    console.error('Error fetching token:', {
      message: err.message,
      response: err.response?.data,
      url: err.config?.url
    });
    res.status(500).send('Authentication failed');
  }
});

// Error handling middleware
app.use((req, res, next) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).sendFile(path.join(rootDir, '404.html'));
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).send('Internal Server Error');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment variables:`);
  console.log(`- REDIRECT_URI: ${process.env.REDIRECT_URI}`);
  console.log(`- SPOTIFY_CLIENT_ID: ${process.env.SPOTIFY_CLIENT_ID}`);
  console.log(`- SPOTIFY_CLIENT_SECRET: ${process.env.SPOTIFY_CLIENT_SECRET ? '***' : 'Not set'}`);
});