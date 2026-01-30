const express = require('express');
const router = express.Router();
// Import the functions we just fixed
const { signUp, login, logout, checkAuth } = require('../controllers/authController');

router.post('/signup', signUp);
router.post('/login', login);
router.post('/logout', logout);

// Example of a Protected Route (Needs checkAuth)
router.get('/profile', checkAuth, (req, res) => {
    res.json({ message: "This is a protected profile data" });
});

module.exports = router;