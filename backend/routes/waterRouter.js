const router = require('express').Router();
const { logWater, getTodayWater, deleteWaterLog, updateWaterLog } = require('../controllers/waterController');
const authenticate = require('../middlewares/Authenticate');

router.post('/log', authenticate, logWater);
router.get('/today', authenticate, getTodayWater);
router.delete('/delete/:id', authenticate, deleteWaterLog);
router.put('/update/:id', authenticate, updateWaterLog);

module.exports = router;