const crypto = require('crypto');
const validatorPkg = require('validator');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/user');
const { EmailError, PasswordError, PasswordMismatchError } = require('../custom-errors/auth/signup');
const { standardResponse } = require('../utils/utils');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));

const showSignUpPage = (req, res) => {
    res.render('./auth/signUp', {
        activePath: '/signUp',
        pageTitle: 'Sign up'
    });
};

const registerNewUser = async (req, res, next) => {
    const name = req.body['user-name-field'];
    const email = req.body['user-email-field'];
    const password = req.body['user-password-field'];
    const confirmPassword = req.body['user-cnf-password-field'];

    let passwordsMatch = true;

    try {
        // check if both password fields contain the same password
        if (!validatorPkg.equals(password, confirmPassword)) {
            passwordsMatch = false;
        }

        const user = new User({name, email, password});

        // if passwords do not match, manually run mongoose validation on user document
        // to make sure that even if user document passes mongoose validation
        // password mismatch error is thrown
       if (!passwordsMatch) {
            await user.validate();
            // if user document is validated but passwords do not match throw error
           throw new PasswordMismatchError('passwords do not match');
       }

        await user.save();
        res.status(201).send(standardResponse('success', 'user resgistered successfully'));

    } catch (error) {
        if (!passwordsMatch) { error.passwordsMatch = false; }
        next(error);
    }
};

const showLoginPage = (req, res) => {
    const message = req.flash('message'); // array

    res.render('./auth/login', {
        activePath: '/login',
        pageTitle: 'Login',
        message: message[0] || ''
    });
};

const login = async (req, res) => {
    const email = req.body['user-email-field'];
    const password = req.body['user-password-field'];

    try {
        const user = await User.verifyCredentials(email, password);

        // save user session
        req.session.email = user.email;
        req.session.isAuthenticated = true;
        req.session.isAdmin = user.isAdmin;
        res.redirect('/');

    } catch (error) {
        req.flash('message', error.message);
        res.redirect('/login');
    }
};

const logout = (req, res, next) => {
    try {
        req.session.destroy((error) => {
            if (error) {
                throw new Error('something went wrong while logging out')
            }
            res.redirect('/login');
        });
    } catch (error) {
        next(error);
    }
};

const forgotPasswordPage = (req, res) => {
    res.render('./auth/forgot-password', {
        pageTitle: 'Forgot Password',
        activePath: '/forgot-password',
    });
};

const postForgotPassword = async (req, res, next) => {
    const email = req.body['user-email-field'];

    try {
        if (!validatorPkg.isEmail(email)) {
            throw new EmailError('invalid email format');
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            throw new EmailError('user with specified email doesn\'t exists');
        }

        // generate token that will be sent to user with the email
        crypto.randomBytes(32, async (error, buffer) => {
            const token = buffer.toString('hex');

            try {
                // save token and its expiry in database
                user.passwordResetToken = token;
                user.passwordResetTokenExpiryDate = Date.now() + 3600000; // current time + 1 hour (milliseconds)
                await user.save();

                // email html styled with responsive email inliner
                transporter.sendMail({
                    to: email,
                    from: 'shop@email.com',
                    subject: 'Password Reset Request',
                    html: `
                        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
                        <html xmlns="http://www.w3.org/1999/xhtml">
                        <head></head>
                        <body>
                            <style></style>
                            <div class="container" style="background:#17804a;color:#fff;padding:40px 5px;text-align:center">
                                <h1 style="margin:0">Hello ${user.name}</h1>
                                <p>Looks like you forgot your password</p>
                                <p>Click <a href="http://localhost:3000/reset-password/${token}" style="color:#fc3">here</a> to reset your password</p>
                                <small>Keep in mind that this link is only valid for 1 hour after it was sent to you.</small>
                            </div>
                        </body>
                        </html>
                    `
                });

                // user will be redirected based on this JSON response from client side javascript
                // (forgot-password.js)
                // as POST request is sent via AJAX, res.redirect won't work on server side,
                // so redirect user via javascript on client side (forgot-password.js)
                res.status(200).send(standardResponse('success', 'forgot password success'));

            } catch (error) {
                console.log(error.message);
            }
        });

    } catch (error) {
        next(error);
    }
};

const passwordResetPage = async (req, res, next) => {
    const token = req.params.token;

    try {
        // check if token in the link has expired or not
        const user = await User.findOne({ passwordResetToken: token });

        if (!user) {
            res.redirect('/login');
            return;
        }

        const isTokenValid = Date.now() < user.passwordResetTokenExpiryDate;

        res.render('./auth/reset-password', {
            pageTitle: 'Reset Password',
            activePath: '/reset-password',
            isTokenValid: isTokenValid,
            token: token
        });

    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    const newPassword = req.body['user-password-field'];
    const passwordResetToken = req.body.passwordResetTokenField;

    try {
        const user = await User.findOne({ passwordResetToken: passwordResetToken });

        if (!user) {
            res.redirect('/login');
            return;
        }

        const isTokenValid = Date.now() < user.passwordResetTokenExpiryDate;

        if (isTokenValid) {
            // update password, remove password reset token fields and save user document
            await user.resetPassword(newPassword);
            res.status(200).send(standardResponse('success', 'password reset successfully'));

        } else {
            // remove password reset token fields and save user document
            await user.removePasswordResetToken();
            throw new PasswordError('password reset failed due to expired token');
        }

    } catch (error) {
        next(error);
    }
};

module.exports = {
    showSignUpPage,
    registerNewUser,
    showLoginPage,
    login,
    logout,
    forgotPasswordPage,
    postForgotPassword,
    passwordResetPage,
    resetPassword
};