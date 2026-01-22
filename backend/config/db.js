const mongoose = require('mongoose');

const connectDb = () => mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Database connected');
}).catch((err) => {
    console.log('Database connection error', err);
});

module.exports = connectDb;
