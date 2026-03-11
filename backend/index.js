const express = require('express');
const connectDb = require('./config/db');
const app = express();
require('dotenv').config();
const cors = require('cors');


connectDb();
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/authRouter'));
app.use('/api/food', require('./routes/foodRouter'));
app.use('/api/profile', require('./routes/profileRouter'));
app.use('/api/chat',require('./routes/chatBotRouter'));
app.use('/api/water', require('./routes/waterRouter'));
app.use('/api/exercise', require('./routes/exerciseRouter'));

app.get('/',(req,res)=>{
    res.send('Hello World');
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

