const cheerio = require('cheerio');
const Product = require('../../src/models/product');
const { deleteProductImage } = require('../../src/utils/utils');

// extracts csrf token from the html text
function extractCsrfToken(res) {
    const $ = cheerio.load(res.text);
    return $('[name=_csrf]').val();
}

// returns csrf token for a given route
// this method is needed because once user is logged in,
// same session id will be used but csrf token will be
// different on each page
// so this method will be used to get csrf token once user is logged in
// if session id is not provided, auth middleware will reject the request
const getCsrfToken = async (request, app, sessionID, route) => {
    let csrfToken;
    await request(app)
            .get(route)
            .set('Cookie', sessionID)
            .then(res => {
                csrfToken = extractCsrfToken(res);
            });

    return csrfToken;
};

// return csrf token and session id to pass in headers for a given route
// session id is used for csrf token validation
const getCsrfTokenAndSessionID = async (request, app, route) => {
    let csrfToken, sessionID;
    await request(app)
            .get(route)
            .then(res => {
                csrfToken = extractCsrfToken(res);
                sessionID = res.headers['set-cookie'][0].split(';')[0];
            });

    return { csrfToken, sessionID };
};

const getSignUpFormData = () => {
    return {
        'user-name-field': 'test user',
        'user-email-field': 'test@testemail.com',
        'user-password-field': 123456,
        'user-cnf-password-field': 123456
    };
};

const getLoginFormData = () => {
    return {
        'user-email-field': 'test@testemail.com',
        'user-password-field': 123456,
    };
};

const sendSignUpRequest = async (request, app, headers, signupFormData) => {
    return await request(app)
                    .post('/signup')
                    .set('CSRF-Token', headers.csrfToken)
                    .set('Cookie', headers.sessionID)
                    .type('form')
                    .send(signupFormData);
};

const makeUnauthGETRequest = async (request, app, route) => {
    await request(app)
            .get(route)
            .expect(302)
            .expect('Location', '/login');
};

const makeUnauthPOSTRequest = async (request, app, route) => {
    await request(app)
            .post(route)
            .expect(302)
            .expect('Location', '/login');
};

const makeLoginRequest = async (request, app, headers, loginFormData) => {
    return await request(app)
                    .post('/login')
                    .type('form')
                    .set('CSRF-Token', headers.csrfToken)
                    .set('Cookie', headers.sessionID)
                    .send(loginFormData)
};

const getAddProductFormData = () => {
    return {
        'product-name-field': 'Lamp',
        'product-price-field': 12,
        'product-description-field': 'OLED Lamp with bright light'
    };
};

const deleteTestProduct = async () => {
    // get image path of test product
    const productsArr = await Product.find({});
    const imagePath = productsArr[0].imagePath;

    // delete test product
    await Product.deleteMany();

    // delete image associated with test product
    deleteProductImage(imagePath);
};

module.exports = {
    sendSignUpRequest,
    getSignUpFormData,
    getLoginFormData,
    makeUnauthGETRequest,
    makeUnauthPOSTRequest,
    makeLoginRequest,
    getAddProductFormData,
    extractCsrfToken,
    getCsrfToken,
    getCsrfTokenAndSessionID,
    deleteTestProduct
};