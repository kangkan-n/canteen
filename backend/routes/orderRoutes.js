const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getAllOrders, getOrder, updateOrderStatus, cancelOrder, getOrderStats } = require('../controllers/orderController');
const { protect, requireVerified } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, requireVerified, placeOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/all', protect, authorize('canteenOwner'), getAllOrders);
router.get('/stats', protect, authorize('canteenOwner'), getOrderStats);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, authorize('canteenOwner'), updateOrderStatus);
router.post('/:id/cancel', protect, cancelOrder);

module.exports = router;
