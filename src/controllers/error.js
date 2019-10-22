const pageNotFound = (req, res) => {
    res.render('./errors/page-not-found', {
        activePath: '404-page',
        pageTitle: '404 Page not found'
    });
};

const serverErrorPage = (req, res) => {
    res.render('./errors/server-error-page', {
        activePath: '500-page',
        pageTitle: 'Server Error'
    });
};

module.exports = {
    pageNotFound,
    serverErrorPage
};