const mongoose = require('mongoose');
const validatorPkg = require('validator');
const bcrypt = require('bcrypt');
const customErrors = require('../custom-errors/auth/signup');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        validate(value) {
            if (value.length < 3) {
                throw new customErrors.NameError('name should be atleast 3 characters long');
            }

            if (value === '' || !value) {
                throw new customErrors.NameError('name is required');
            }

            if (!validatorPkg.matches(value, /^[A-Za-z\s]+$/)) {
                throw new customErrors.NameError('name should only contain alphabets with optional whitespace');
            }
        }
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        validate(value) {
            if (!validatorPkg.isEmail(value)) {
                throw new customErrors.EmailError('Invalid email address format');
            }

            if (value === '' || !value) {
                throw new customErrors.EmailError('email is required');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length < 6) {
                throw new customErrors.PasswordError('password should be atleast 6 characters long');
            }

            if (value === '' || !value) {
                throw new customErrors.PasswordError('password is required');
            }
        }
    },
    passwordResetToken: {
        type: String
    },
    passwordResetTokenExpiryDate: {
        type: Date
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    cart: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, min: 1, default: 1 }
        }
    ]
});

// hash user password before saving it in database
userSchema.pre('save', async function(next) {
    const user = this;

    // if password field is modified only then hash the password
    // will be useful when updating user information
    // is password is not changed by the user, it won't be hashed again
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

userSchema.statics.verifyCredentials = async (email, password) => {
    try {
        const user = await User.findOne({ email });

        // if user with given email not found
        if (!user) {
            throw new Error('invalid email/password combination');
        }

        // if user with email found
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            throw new Error('invalid email/password combination');
        }

        return user;

    } catch (error) {
        throw error;
    }
};

userSchema.methods.resetPassword = async function(newPassword) {
    const user = this;

    try {
        user.password = newPassword;
        await user.removePasswordResetToken();
    } catch (error) {
        throw error;
    }
};

// remove password reset token fields for the user from the database
userSchema.methods.removePasswordResetToken = async function() {
    const user = this;

    try {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiryDate = undefined;
        await user.save();
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;