const express = require('express');
const router = express.Router();
const axios = require('axios');
const authenticate = require('../middlewares/Authenticate');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Multiple free models — tries each one if previous is rate-limited


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

router.post('/generate', authenticate, async (req, res) => {
  const { calories, diet, exclude, region } = req.body;
  if (!calories) return res.status(400).json({ message: 'Calorie requirement is needed.' });

  const prompt = `You are an expert Indian nutritionist and chef. Generate a complete 1-day Indian meal plan.

USER REQUIREMENTS:
- Daily calorie target: ${calories} kcal
- Diet type: ${diet || 'no restrictions'}
- Exclude ingredients: ${exclude || 'none'}
- Region preference: ${region || 'any Indian region'}

Respond ONLY with a valid JSON object. No markdown, no code blocks, no explanation. Just raw JSON using this exact structure:
{
  "totalCalories": 2000,
  "totalProtein": 75,
  "totalCarbs": 250,
  "totalFat": 65,
  "meals": [
    {
      "type": "Breakfast",
      "name": "Masala Oats with Vegetables",
      "calories": 350,
      "protein": 12,
      "carbs": 55,
      "fat": 8,
      "prepTime": "15 mins",
      "servings": 1,
      "ingredients": ["1 cup oats", "1 onion chopped", "1 tomato", "cumin seeds", "salt"],
      "steps": ["Heat oil", "Saute onion and tomato", "Add oats and water", "Cook 5 mins", "Serve hot"],
      "tags": ["High Fiber", "Quick", "Vegetarian"]
    },
    {
      "type": "Lunch",
      "name": "Dal Tadka with Brown Rice",
      "calories": 650,
      "protein": 22,
      "carbs": 95,
      "fat": 18,
      "prepTime": "30 mins",
      "servings": 1,
      "ingredients": ["1 cup toor dal", "1 cup brown rice", "1 onion", "2 tomatoes", "ghee", "cumin", "turmeric"],
      "steps": ["Pressure cook dal", "Cook rice separately", "Make tadka with ghee and spices", "Pour over dal", "Serve with rice"],
      "tags": ["Protein Rich", "Balanced", "Traditional"]
    },
    {
      "type": "Snack",
      "name": "Roasted Chana with Chai",
      "calories": 200,
      "protein": 10,
      "carbs": 28,
      "fat": 4,
      "prepTime": "5 mins",
      "servings": 1,
      "ingredients": ["50g roasted chana", "1 cup masala chai", "chaat masala"],
      "steps": ["Toss chana with chaat masala", "Brew masala chai", "Serve together"],
      "tags": ["High Protein", "Low Fat", "Quick"]
    },
    {
      "type": "Dinner",
      "name": "Palak Paneer with Roti",
      "calories": 550,
      "protein": 25,
      "carbs": 60,
      "fat": 22,
      "prepTime": "35 mins",
      "servings": 1,
      "ingredients": ["200g paneer", "2 bunches spinach", "2 onions", "2 tomatoes", "garam masala", "2 rotis"],
      "steps": ["Blanch and blend spinach", "Saute onion tomato with spices", "Add spinach puree", "Add paneer and simmer", "Serve with rotis"],
      "tags": ["Iron Rich", "Calcium", "Vegetarian"]
    }
  ]
}

Make it authentic Indian food matching the region and diet type. Calories should total roughly ${calories} kcal.`;

  try {
    const rawText = await callAI(prompt);
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    const mealPlan = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
    return res.status(200).json(mealPlan);
  } catch (err) {
    console.error('Meal plan error:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Failed to generate meal plan. All AI models are busy, please try again in a moment.' });
  }
});

module.exports = router;