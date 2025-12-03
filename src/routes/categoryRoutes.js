const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin-only routes
router.post('/', protect, authorize('ADMIN'), categoryController.createCategory);
router.put('/:id', protect, authorize('ADMIN'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('ADMIN'), categoryController.deleteCategory);

module.exports = router;
