const router = require('express').Router();
const axios = require('axios');
const API_URL = "https://api.aimlapi.com"; // Ensure this is the correct endpoint
const API_KEY = process.env.CHAT_API_KEY; // Ensure the API key is set in .env

router.post('/chats', async (req, res) => {
  const { message } = req.body;

  // Log incoming message
  console.log("Received message from user:", message);

  try {
    // Make the API call to AIML API using axios
    const response = await axios.post(`${API_URL}/v1/chat/completions`, {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant focused on diet tracking and health advice. Please respond in English."
        },
        {
          role: "user",
          content: message
        }
      ]
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      }
    });

    // Assuming the API returns a response with a 'choices' field
    const chatBotReply = response.data.choices[0]?.message?.content || "Sorry, I didn't understand that.";
    res.json({ reply: chatBotReply });

  } catch (error) {
    console.error("Error calling AIML API:", error.response?.data || error.message);
    res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
});

module.exports = router;
