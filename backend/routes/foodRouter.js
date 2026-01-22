const router = require('express').Router();
const { createFood, getUserFoods, deleteFood } = require('../controllers/foodController');
const authenticate = require('../middlewares/Authenticate');

router.post('/createFood',authenticate, createFood);
router.get('/allFood',authenticate, getUserFoods);
router.delete('/deleteFood/:id',authenticate, deleteFood);

module.exports = router;