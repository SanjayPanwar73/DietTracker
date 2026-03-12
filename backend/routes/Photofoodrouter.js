const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const authenticate = require('../middlewares/Authenticate');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;



const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

async function callAI(prompt) {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'openrouter/free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'DietTracker',
      },
    }
  );
  return response.data.choices[0].message.content;
}

router.post('/analyzePhoto', authenticate, upload.single('image'), async (req, res) => {
  const foodName = req.body.foodName || 'mixed food';

  const prompt = `You are a professional nutritionist. Estimate accurate nutritional values for: "${foodName}".

Respond ONLY with raw JSON. No markdown, no code blocks, no explanation. Just this exact JSON:
{
  "foodName": "${foodName}",
  "description": "brief one sentence description of this food",
  "confidence": 0.85,
  "servingSize": "1 medium serving ~200g",
  "nutrition": {
    "calories": 300,
    "protein_g": 15,
    "fat_total_g": 10,
    "fat_saturated_g": 3,
    "carbohydrates_total_g": 35,
    "fiber_g": 4,
    "sugar_g": 5,
    "sodium_mg": 400,
    "potassium_mg": 300,
    "cholesterol_mg": 50
  }
}

Use realistic values for this specific food. Be accurate.`;

  try {
    const rawText = await callAI(prompt);
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Food analysis error:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Failed to analyze food. Please try again in a moment.' });
  }
});

module.exports = router;