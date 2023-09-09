import axios from 'axios'

const apiKey = process.env.openai
const organization = process.env.organization

axios.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`
axios.defaults.headers.common['OpenAI-Organization'] = organization
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.transformResponse = [(data) => data]

export default async function handler(req, res) {
  if (req.method == 'POST') {
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        data: req.body, 
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      });

      // Collect chunks in an array
      const chunks = []

      response.data.on('data', (chunk) => {
        chunks.push(chunk); 
      });

      response.data.on('end', () => {
        res.status(200).json(chunks.join('')); 
      });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  else {
    res.status(404).json({error: "API route not found"})
  }
}