const router = require('express').Router();
const {createProfile, getProfile, updateProfile} = require('../controllers/profileController');
const authenticate = require('../middlewares/Authenticate');

router.post('/createProfile', authenticate, createProfile);
router.get('/getProfile', authenticate, getProfile);
router.put('/updateProfile', authenticate, updateProfile);

module.exports = router;
