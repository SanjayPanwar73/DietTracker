const express = require('express');
const router = express.Router();
const axios = require('axios');
const authenticate = require('../middlewares/Authenticate');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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

function parseInsights(rawText) {
  // Remove markdown fences
  let cleaned = rawText.replace(/```json|```/g, '').trim();

  // Try 1: direct JSON array parse
  try {
    const arrStart = cleaned.indexOf('[');
    const arrEnd = cleaned.lastIndexOf(']');
    if (arrStart !== -1 && arrEnd !== -1) {
      const arr = JSON.parse(cleaned.slice(arrStart, arrEnd + 1));
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch (e) {}

  // Try 2: extract numbered lines like "1. insight text" or "- insight text"
  const lines = cleaned
    .split('\n')
    .map(l => l.replace(/^[\d\.\-\*\s]+/, '').trim())
    .filter(l => l.length > 20); // real insight lines are longer than 20 chars

  if (lines.length >= 3) return lines.slice(0, 5);

  // Try 3: split by double newline
  const chunks = cleaned.split(/\n\n+/).map(c => c.trim()).filter(c => c.length > 20);
  if (chunks.length >= 3) return chunks.slice(0, 5);

  throw new Error('Could not parse insights from AI response');
}

router.post('/weekly', authenticate, async (req, res) => {
  const {
    goal, calorieGoal, dailyCalories, dailyProtein,
    dailyCarbs, dailyFat, avgCalories, daysLogged,
    daysOnTrack, avgProtein, days,
  } = req.body;

  const prompt = `You are a professional nutritionist. Analyze this user's weekly diet data.

USER PROFILE:
- Goal: ${goal}
- Daily calorie target: ${calorieGoal} kcal

WEEKLY DATA:
- Daily calories (${days.join(', ')}): ${dailyCalories.map(Math.round).join(', ')} kcal
- Daily protein: ${dailyProtein.map(Math.round).join(', ')} g
- Daily carbs: ${dailyCarbs.map(Math.round).join(', ')} g
- Daily fat: ${dailyFat.map(Math.round).join(', ')} g
- Average calories: ${avgCalories} kcal
- Days logged: ${daysLogged}/7
- Days on track: ${daysOnTrack}/7
- Average protein: ${avgProtein}g

Give exactly 5 personalized insights. Number them 1 to 5. Each on its own line. No JSON, no markdown, just plain numbered lines.

1. [insight about calorie consistency]
2. [insight about protein intake]
3. [insight about a specific day pattern]
4. [insight about macros]
5. [one actionable tip for next week]`;

  try {
    const rawText = await callAI(prompt);
    console.log('Raw insights response:', rawText.substring(0, 200));
    const insights = parseInsights(rawText);
    return res.status(200).json({ insights });
  } catch (err) {
    console.error('Insights error:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Failed to generate insights. Please try again.' });
  }
});

module.exports = router;