const authMiddleware = (req, res, next) => {
    if (req.url === '/login' && req.session.isAuthenticated) {
        res.redirect('/');
        return;
    }

    if (req.url !== '/login' && !req.session.isAuthenticated) {
        res.redirect('/login');
        return;
    }

    next();
};

module.exports = authMiddleware;