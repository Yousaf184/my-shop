const express = require('express');
const adminController = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');
const getCartCount = require('../middleware/cart-count');

const router = express.Router();

router.get('/add-product', authMiddleware, getCartCount, adminController.addProductPage);
router.get('/edit-product/:productId', authMiddleware, getCartCount, adminController.editProductPage);
router.get('/products', authMiddleware, getCartCount, adminController.showAdminProductsPage);

router.post('/add-product', authMiddleware, getCartCount, adminController.addProduct);
router.post('/edit-product', authMiddleware, getCartCount, adminController.editProduct);
router.post('/delete-product', authMiddleware, getCartCount, adminController.deleteProduct);

module.exports = router;