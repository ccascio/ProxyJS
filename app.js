// app.js

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware to attach headers
app.use((req, res, next) => {
  // Retrieve the API key from the environment variable
  const apiKey = process.env.openai;
  const organization = process.env.organization;

  // Attach headers to the axios instance
  axios.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
  axios.defaults.headers.common['OpenAI-Organization'] = organization;
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  // Add this to configure axios global defaults
  axios.defaults.transformResponse = [data => data];
  next();
});


// Endpoint to receive JSON payload and call OpenAI API
app.post('/api/chat', async (req, res) => {
  try {
    console.log(req.body)
    // Make request 
    const response = await axios({
      method: 'POST',
      url: 'https://api.openai.com/v1/chat/completions',
      data: req.body, 
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'stream'
    });

    // Set streaming headers
    res.set('Content-Type', 'text/event-stream'); 
    res.set('Connection', 'keep-alive');

    // Stream response chunks
    response.data.on('data', (chunk) => {
      console.log(chunk.toString()) // convert to string
      res.write(chunk); 
    });

    response.data.on('end', () => {
      res.end(); 
    });
  } catch (error) {
    console.error('Error:', error.message);
    //console.log(error.response.data)
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});