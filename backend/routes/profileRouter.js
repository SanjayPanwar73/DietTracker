const router = require('express').Router();
// Yahan updateProfile ko bhi destructure karke nikaalein
const { createProfile, getProfile, updateProfile } = require('../controllers/profileController'); 
const authenticate = require('../middlewares/Authenticate');

router.post('/createProfile', authenticate, createProfile);
router.get('/getProfile', authenticate, getProfile);

router.put('/updateProfile', authenticate, updateProfile); 

module.exports = router;