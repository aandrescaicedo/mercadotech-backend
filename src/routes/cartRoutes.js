const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, cartController.getCart);
router.put('/', protect, cartController.updateCart);
router.post('/sync', protect, cartController.syncCart);

module.exports = router;
