const express = require('express');
const router = express.Router();
const { getPendingStudents, getAllStudents } = require('../controllers/verificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/pending', protect, authorize('canteenOwner'), getPendingStudents);
router.get('/students', protect, authorize('canteenOwner'), getAllStudents);

module.exports = router;
