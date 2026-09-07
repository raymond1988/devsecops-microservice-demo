const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5000';

// Public endpoint to request a JWT token
app.post('/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/login`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Auth service error" });
  }
});

// Protected endpoint requiring valid JWT
app.get('/dashboard', async (req, res) => {
  const authHeader = req.headers['authorization'];

  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/validate`, {
      headers: { Authorization: authHeader }
    });

    res.json({
      message: "Access granted to secure dashboard",
      user: response.data.user_id,
      role: response.data.role
    });
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Unauthorized access" });
  }
});

app.listen(PORT, () => console.log(`API Service listening on port ${PORT}`));