const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Internal DNS resolution in Docker Compose allows using the service name 'auth-service'
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5000';
const FUN_URL = process.env.FUN_URL || 'http://auth-service:5000';

app.get('/dashboard', async (req, res) => {
  const authHeader = req.headers['authorization'];

  try {
    // Service-to-Service call across Docker internal bridge network
    const response = await axios.get(`${AUTH_SERVICE_URL}/validate`, {
      headers: { Authorization: authHeader }
    });

    res.json({
      message: "Access granted to secure dashboard",
      user: response.data.user_id
    });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: "Failed to connect to internal auth service" });
  }
});

app.get('/fun', async (req, res) => {
  try {
    const response = await axios.get(`${FUN_URL}/fun`);
    res.json({
      status: response.data.status
    });
  } catch (error) {
    if (error.response){
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({error: "Failed to connect to internal auth service"})
  }
});

app.listen(PORT, () => console.log(`API Service running on port ${PORT}`));