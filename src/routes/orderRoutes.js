const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, orderController.createOrder);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/store-orders', protect, orderController.getOrdersByStore);
router.patch('/:id/status', protect, orderController.updateOrderStatus);

module.exports = router;
