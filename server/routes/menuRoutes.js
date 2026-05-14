const express = require('express');
const router = express.Router();
const { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', protect, authorize('canteenOwner'), createMenuItem);
router.put('/:id', protect, authorize('canteenOwner'), updateMenuItem);
router.delete('/:id', protect, authorize('canteenOwner'), deleteMenuItem);
router.patch('/:id/availability', protect, authorize('canteenOwner'), toggleAvailability);

module.exports = router;
