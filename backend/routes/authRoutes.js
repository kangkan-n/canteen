const express = require('express');
const router = express.Router();
const multer = require('multer');
const { register, login, verifyAccount, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', upload.single('image'), register);
router.post('/login', login);
router.post('/verify', protect, verifyAccount);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
