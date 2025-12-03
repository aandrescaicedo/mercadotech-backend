const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('STORE'), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/store/:storeId', productController.getProductsByStore);
router.put('/:id', protect, authorize('STORE'), productController.updateProduct);
router.delete('/:id', protect, authorize('STORE'), productController.deleteProduct);

module.exports = router;
