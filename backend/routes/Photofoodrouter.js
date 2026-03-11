const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authenticate = require('../middlewares/Authenticate');

// ------------------------------
// Multer configuration
// ------------------------------
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ------------------------------
// Gemini Initialization
// ------------------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ------------------------------
// Photo Analysis Route
// ------------------------------
router.post(
  '/analyzePhoto',
  authenticate,
  upload.single('image'),
  async (req, res) => {

    if (!req.file) {
      return res.status(400).json({
        message: 'No image file provided.'
      });
    }

    try {

      const imageBase64 = req.file.buffer.toString('base64');
      const mediaType = req.file.mimetype;

      // Latest supported model
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
        generationConfig: {
          temperature: 0.2
        }
      });

      const prompt = `
You are a professional nutritionist and food recognition AI.

Analyze this food image carefully.

Identify the food item(s) and estimate nutritional values.

Respond ONLY with valid JSON (no markdown or extra text):

{
  "foodName": "Name of the food",
  "description": "Brief description of the dish",
  "confidence": 0.95,
  "servingSize": "Estimated serving size",
  "nutrition": {
    "calories": 0,
    "protein_g": 0,
    "fat_total_g": 0,
    "fat_saturated_g": 0,
    "carbohydrates_total_g": 0,
    "fiber_g": 0,
    "sugar_g": 0,
    "sodium_mg": 0,
    "potassium_mg": 0,
    "cholesterol_mg": 0
  }
}

If multiple foods appear, estimate for the entire plate.
Confidence must be between 0 and 1.
`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mediaType,
            data: imageBase64
          }
        }
      ]);

      const response = result.response;
      const rawText = response.text();

      // Remove markdown formatting if returned
      const cleaned = rawText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      let parsed;

      try {
        parsed = JSON.parse(cleaned);
      } catch (err) {
        console.error("JSON Parse Error:", cleaned);
        return res.status(500).json({
          message: "AI response format invalid",
          raw: cleaned
        });
      }

      return res.status(200).json(parsed);

    } catch (error) {

      console.error("Photo analysis error:", error);

      return res.status(500).json({
        message: "Failed to analyze image",
        error: error.message
      });

    }

  }
);

module.exports = router;