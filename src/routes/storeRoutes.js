const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('STORE'), storeController.createStore);
router.get('/my-store', protect, authorize('STORE'), storeController.getMyStore);
router.put('/my-store', protect, authorize('STORE'), storeController.updateStore);
router.get('/', storeController.getAllStores);
router.patch('/:id/status', protect, authorize('ADMIN'), storeController.approveStore);

module.exports = router;
