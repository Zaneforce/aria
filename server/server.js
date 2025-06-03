require('dotenv').config();
const express = require('express');
const axios = require('axios');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, '../public')));

const serviceAccount = require('./aria-22507-firebase-adminsdk-fbsvc-e53d8f0586.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Spotify OAuth callback
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token } = tokenResponse.data;
    res.redirect(`/home.html?access_token=${access_token}`);
  } catch (err) {
    console.error('Error fetching token:', err.response?.data || err.message);
    res.status(500).send('Authentication failed');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
