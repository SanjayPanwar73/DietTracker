const router = require('express').Router();
const {createProfile, getProfile} = require('../controllers/profileController');
const authenticate = require('../middlewares/Authenticate');

router.post('/createProfile', authenticate , createProfile);
router.get('/getProfile', authenticate , getProfile);

module.exports = router;