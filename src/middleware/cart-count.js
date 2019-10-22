const User = require('../models/user');

// when user logs in, check if that user has any items in cart,
// if user has any items in count, pass cartItemsCount to every page that is rendered.
const getCartCount = async (req, res, next) => {
    try {
        if (req.session.isAuthenticated) {
            const user = await User.findOne({ email: req.session.email }).select('cart');
            res.locals.cartItemCount = user.cart ? user.cart.length : 0;
        } else {
            res.locals.cartItemCount = null;
        }

        next();

    } catch (error) {
        console.log(error.message);
    }
};

module.exports = getCartCount;