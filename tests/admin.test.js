const request = require('supertest');
const app = require('../src/app');
const connectToDB = require('../src/db/dbConn');
const User = require('../src/models/user');
const mongoose = require('mongoose');
const utils = require('./fixtures/util');

describe('admin tests', () => {
    beforeAll(async () => {
        await connectToDB();
    });

    describe('unauthenticated user', () => {
        test('should redirect unauthenticated user from add product page to login page', async () => {
            await utils.makeUnauthGETRequest(request, app, '/admin/add-product');
        });

        test('should redirect unauthenticated user from edit product page to login page', async () => {
            await utils.makeUnauthGETRequest(request, app, '/admin/edit-product/123');
        });

        test('should redirect unauthenticated user from admin products page to login page', async () => {
            await utils.makeUnauthGETRequest(request, app, '/admin/products');
        });

        test('should not allow unauthenticated user to add product, instead redirect to login page', async () => {
            await utils.makeUnauthGETRequest(request, app, '/admin/add-product');
        });
    });

    describe('authenticated user', () => {
        let sessionID, data;

        beforeAll(async () => {
            // get csrf token and session id for signup request
            data = await utils.getCsrfTokenAndSessionID(request, app, '/signup');
            // create user
            await utils.sendSignUpRequest(request, app, data, utils.getSignUpFormData());
            // get csrf token and session id for login request
            data = await utils.getCsrfTokenAndSessionID(request, app, '/login');
            sessionID = data.sessionID; // this session id will be used for each authenticated request
            // login user
            await utils.makeLoginRequest(request, app, data, utils.getLoginFormData());
        });

        afterAll(async () => {
            // clear sessions collection
            mongoose.connection.collection('sessions').deleteMany();
            // delete test product
            utils.deleteTestProduct();
            // clear users collection
            await User.deleteMany();
        });

        test('should allow authenticated user to add new product', async () => {
            const productData = utils.getAddProductFormData();
            // get csrf token for add-product page
            const csrfToken = await utils.getCsrfToken(request, app, sessionID, '/admin/add-product');
            const response = await request(app)
                                    .post('/admin/add-product')
                                    .set('CSRF-Token', csrfToken)
                                    .set('Cookie', sessionID)
                                    .field('product-name-field', productData['product-name-field'])
                                    .field('product-price-field', productData['product-price-field'])
                                    .field('product-description-field', productData['product-description-field'])
                                    .attach('product-image-field', './tests/fixtures/lamp.jpg');

            expect(response.body.status).toEqual('success');
        });
    });
});