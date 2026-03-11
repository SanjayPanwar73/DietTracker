// backend/controllers/chatBotController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Debugging: Log to see if paths are working
console.log("Loading Models...");
const Profile = require("../models/Profile"); 
const Food = require("../models/Food");
console.log("Models loaded successfully!");

const genAI = new GoogleGenerativeAI(process.env.CHAT_API_KEY);

// Simple in-memory rate limiter (use redis for production)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute window
const MAX_REQUESTS_PER_MINUTE = 10;

const checkRateLimit = (userId) => {
    const now = Date.now();
    const userRequests = requestCounts.get(userId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    
    if (now > userRequests.resetTime) {
        userRequests.count = 0;
        userRequests.resetTime = now + RATE_LIMIT_WINDOW;
    }
    
    userRequests.count++;
    requestCounts.set(userId, userRequests);
    
    return userRequests.count <= MAX_REQUESTS_PER_MINUTE;
};

// Fallback responses when AI is unavailable
const fallbackResponses = {
    greeting: ["Hello! I'm your nutrition coach. What did you eat today?", "Hi there! Tell me about your meals today!"],
    calorie: ["Here's a quick guide: an average egg is about 70 calories, a slice of bread is ~80 calories, and a banana is ~105 calories.", "Common calorie counts: rice (1 cup) ~200, chicken breast (100g) ~165, apple ~95."],
    healthy: ["Great choice! Some healthy alternatives include fruits, vegetables, lean proteins, and whole grains.", "For healthier options, try grilled chicken instead of fried, or switch to whole grain bread!"],
    water: ["Aim for 8 glasses of water daily! Staying hydrated is key for metabolism.", "Recommended daily water intake is about 2-3 liters depending on your activity level."],
    exercise: ["Great question! Aim for at least 30 minutes of moderate exercise daily.", "Try combining cardio with strength training for best results!"],
    protein: ["Good protein sources include chicken, fish, eggs, beans, and tofu.", "Adults should aim for about 0.8g of protein per kg of body weight."],
    default: ["I'm here to help with your nutrition! Tell me what you ate and I'll help you track it.", "That's interesting! Keep tracking your meals for better health insights."]
};

const getFallbackResponse = (message) => {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
        return fallbackResponses.greeting[Math.floor(Math.random() * fallbackResponses.greeting.length)];
    }
    if (lowerMsg.includes('calorie') || lowerMsg.includes('how many') || lowerMsg.includes('count')) {
        return fallbackResponses.calorie[Math.floor(Math.random() * fallbackResponses.calorie.length)];
    }
    if (lowerMsg.includes('healthy') || lowerMsg.includes('good') || lowerMsg.includes('better')) {
        return fallbackResponses.healthy[Math.floor(Math.random() * fallbackResponses.healthy.length)];
    }
    if (lowerMsg.includes('water') || lowerMsg.includes('drink') || lowerMsg.includes('hydration')) {
        return fallbackResponses.water[Math.floor(Math.random() * fallbackResponses.water.length)];
    }
    if (lowerMsg.includes('exercise') || lowerMsg.includes('workout') || lowerMsg.includes('training')) {
        return fallbackResponses.exercise[Math.floor(Math.random() * fallbackResponses.exercise.length)];
    }
    if (lowerMsg.includes('protein') || lowerMsg.includes('muscle') || lowerMsg.includes('amino')) {
        return fallbackResponses.protein[Math.floor(Math.random() * fallbackResponses.protein.length)];
    }
    return fallbackResponses.default[Math.floor(Math.random() * fallbackResponses.default.length)];
};

exports.chatWithAI = async (req, res) => {
    try {
        console.log("chatWithAI called, userId:", req.userId);
        const { message } = req.body;
        console.log("Message:", message);
        
        // Ensure req.userId exists (from your Authenticate middleware)
        if (!req.userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        
        // Check rate limit first
        if (!checkRateLimit(req.userId)) {
            const fallbackReply = "I'm getting too many requests right now. Please wait a moment and try again!";
            return res.status(200).json({ reply: fallbackReply, isFallback: true });
        }
        
        const userId = req.userId;

        // Fetch User Context (with error handling)
        let profile = null;
        let recentLogs = [];
        
        try {
            profile = await Profile.findOne({ user: userId });
            recentLogs = await Food.find({ user: userId }).sort({ date: -1 }).limit(3);
        } catch (dbError) {
            console.error("Database error fetching profile/logs:", dbError);
            // Continue with default values if profile doesn't exist
        }

        // Try to use Gemini AI
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

            const prompt = `
                You are a helpful Nutrition AI for the "DietTracker" app. 
                User Profile: Goal is ${profile?.goal || 'General Health'}, Target Calories: ${profile?.dailyCalories || 2000}.
                Recent Food Logs: ${JSON.stringify(recentLogs)}.
                
                Instructions:
                - If the user says they ate something, estimate the calories/macros and tell them.
                - Provide healthy alternatives if they ask for junk food.
                - Be concise and motivating.
                
                User says: "${message}"
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            
            res.status(200).json({ reply: response.text() });
        } catch (aiError) {
            // Check if it's a quota error
            const isQuotaError = aiError.message?.includes('429') || aiError.message?.includes('quota');
            
            if (isQuotaError) {
                console.warn("AI Quota exceeded, using fallback. Retry after 60 seconds.");
            } else {
                console.error("AI Error, using fallback:", aiError.message);
            }
            
            const fallbackReply = getFallbackResponse(message);
            res.status(200).json({ reply: fallbackReply, isFallback: true });
        }
    } catch (error) {
        console.error("Detailed AI Error:", error.message);
        console.error("Full error:", error);
        
        // Use fallback on any error
        const fallbackReply = getFallbackResponse(req.body.message || "");
        res.status(200).json({ reply: fallbackReply, isFallback: true });
    }
};
