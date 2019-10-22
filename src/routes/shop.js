const express = require('express');
const shopController = require('../controllers/shop');
const authMiddleware = require('../middleware/auth');
const getCartCount = require('../middleware/cart-count');

const router = express.Router();

// GET => /
// GET => /page=1
router.get('/', getCartCount, shopController.showProductList);
router.get('/products/:productId', getCartCount, shopController.showProductDetails);
router.get('/cart', authMiddleware, getCartCount, shopController.showCart);
router.get('/orders', authMiddleware, getCartCount, shopController.showMyOrdersPage);
router.get('/checkout', authMiddleware, getCartCount, shopController.showCheckoutPage);
router.get('/invoice/:orderId', authMiddleware, shopController.generateOrderInvoice);

router.post('/cart', authMiddleware, getCartCount, shopController.postCart);
router.post('/cart/remove', authMiddleware, getCartCount, shopController.removeProductFromCart);
// POST => /cart/increase
// POST => /cart/decrease
router.post('/cart/:changeQuantity', authMiddleware, getCartCount, shopController.changeProdQuantityInCart);

// following route handler has been movied to index.js file before the csurf middleware
// to avoid invalid csrf token error when stripe form is submitted
// router.post('/order', authMiddleware, passCartCount, shopController.order);

module.exports = router;