const router = require('express').Router();
const { createFood, getUserFoods, deleteFood, getStreak } = require('../controllers/foodController');
const authenticate = require('../middlewares/Authenticate');

router.post('/createFood',authenticate, createFood);
router.get('/allFood',authenticate, getUserFoods);
router.delete('/deleteFood/:id',authenticate, deleteFood);
router.get('/streak', authenticate, getStreak);

module.exports = router;