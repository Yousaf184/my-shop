const mongoose = require('mongoose');
const validatorPkg = require('validator');
const customErrors = require('../custom-errors/admin/edit-product');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (validatorPkg.isNumeric(value)) {
                throw new customErrors.ProductNameError('name cannot be numeric');
            }

            if (value.length < 3) {
                throw new customErrors.ProductNameError('name should contain atleast 3 characters');
            }
        }
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    description: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (validatorPkg.isNumeric(value)) {
                throw new customErrors.ProductDescError('description cannot be numeric');
            }

            if (value.length < 10) {
                throw new customErrors.ProductDescError('description should contain atleast 10 characters');
            }
        }
    },
    imagePath: {
        type: String,
        required: true,
        trim: true
    },
    userEmail: {
        type: String,
        ref: 'User',
        required: true
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;