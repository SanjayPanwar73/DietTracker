const express = require('express');
const connectDb = require('./config/db');
const app = express();
require('dotenv').config();
const cors = require('cors');

connectDb();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Existing routes
app.use('/api/auth', require('./routes/authRouter'));
app.use('/api/food', require('./routes/foodRouter'));
app.use('/api/profile', require('./routes/profileRouter'));
app.use('/api/chat', require('./routes/chatBotRouter'));

// New AI-powered routes (OpenRouter)
app.use('/api/food', require('./routes/Photofoodrouter'));       // Photo food logger
app.use('/api/mealplan', require('./routes/mealPlanRouter'));    // Indian meal planner
app.use('/api/insights', require('./routes/insightsRouter'));    // Weekly AI insights

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});