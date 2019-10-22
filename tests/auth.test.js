const request = require('supertest');
const app = require('../src/app');
const connectToDB = require('../src/db/dbConn');
const utils = require('./fixtures/util');
const User = require('../src/models/user');
const mongoose = require('mongoose');

describe('auth tests', () => {
    let data;

    beforeAll(async () => {
        await connectToDB();
        // get csrf token and session id for /signup route
        data = await utils.getCsrfTokenAndSessionID(request, app, '/signup');
    });

    afterAll(async () => {
        await User.deleteMany();
    });

    describe('signup', () => {
        test('should not sign up new user, instead throw error about non-matching passwords', async () => {
            const signupData = { ...utils.getSignUpFormData(), 'user-cnf-password-field': 111222 };
            const res = await utils.sendSignUpRequest(request, app, data, signupData);
            expect(res.body.status).toEqual('error');
            expect(res.body.errors[0].name).toEqual('PasswordMismatchError');
        });

        test('should sign up new user', async () => {
            const signupFormData = utils.getSignUpFormData();
            const res = await utils.sendSignUpRequest(request, app, data, signupFormData);
            expect(res.body.status).toEqual('success');

            // check if user was inserted in database
            const user = await User.findOne({ email: signupFormData['user-email-field'] });
            expect(user).not.toBeNull();
            expect(user.name).toEqual(signupFormData['user-name-field']);
            expect(user.isAdmin).toBeFalsy();
        });

        test('should not sign up new user, instead throw errors about user name and password length', async () => {
            const signupFormData = {
                'user-name-field': 'test 123',
                'user-email-field': 'test@testemail.com',
                'user-password-field': 12345,
                'user-cnf-password-field': 12345
            };

            const res = await utils.sendSignUpRequest(request, app, data, signupFormData);
            expect(res.body.status).toEqual('error');
            expect(res.body.errors.length).toEqual(2);
            expect(res.body.errors[0].name).toEqual('NameError');
            expect(res.body.errors[1].name).toEqual('PasswordError');
        });

        test('should not sign up new user, instead throw error about user name length', async () => {
            const signupFormData = { ...utils.getSignUpFormData(), 'user-name-field': 'n' };

            const res = await utils.sendSignUpRequest(request, app, data, signupFormData);
            expect(res.body.status).toEqual('error');
            expect(res.body.errors.length).toEqual(1);
            expect(res.body.errors[0].name).toEqual('NameError');
        });

        test('should not sign up new user, instead throw error about duplicate email', async () => {
            const res = await utils.sendSignUpRequest(request, app, data, utils.getSignUpFormData());
            expect(res.body.status).toEqual('error');
            expect(res.body.errors.length).toEqual(1);
            expect(res.body.errors[0].name).toEqual('EmailError');
        });
    });

    describe('login', () => {
        const sessionCollection = mongoose.connection.collection('sessions');

        afterAll(async () => {
            await sessionCollection.deleteMany();
        });

        test('should not login user because of incorrect password', async () => {
            const loginFormData = { ...utils.getLoginFormData(), 'user-password-field': 111 };

            await utils.makeLoginRequest(request, app, data, loginFormData);
            // check if user session was saved in 'sessions' collection
            const doc = await sessionCollection.findOne({ 'session.email': loginFormData['user-email-field'] });
            expect(doc).toBeNull();
        });

        test('should login user', async () => {
            const loginFormData = utils.getLoginFormData();

            await utils.makeLoginRequest(request, app, data, loginFormData);
            // check if user session was saved in 'sessions' collection
            const doc = await sessionCollection.findOne({ 'session.email': loginFormData['user-email-field'] });
            expect(doc).not.toBeNull();
            expect(doc.session.email).toEqual(loginFormData['user-email-field']);
            expect(doc.session.isAuthenticated).toBeTruthy();
        });
    });
});