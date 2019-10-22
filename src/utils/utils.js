const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const {
    NameError,
    EmailError,
    PasswordError,
    PasswordMismatchError
} = require('../custom-errors/auth/signup');
const {
    ProductNameError,
    FileUploadError,
    ProductDescError
} = require('../custom-errors/admin/edit-product');

// pageNumber is the query param 'page'
// userEmail is required for rendering products on admin page
const getAllProductsWithPaginationInfo = async (pageNumber, productsPerPage, userEmail) => {
    let productsCount = 0;
    const filter = {};

    if (userEmail !== null) {
        // filter object will be used to find products created by current admin user
        filter.userEmail = userEmail;
    }

    // count total products
    productsCount = await Product.find(filter).countDocuments();
    const lastPage = Math.ceil(productsCount / productsPerPage);

    // if query parameter 'page' is greater than the last page number
    // set the pageNumber to last page number
    if (lastPage > 0 && lastPage < pageNumber) {
        pageNumber = lastPage;
    } else if (pageNumber < 1) {
        // if query parameter 'page' is less than 1,
        // set pageNumber to 1
        pageNumber = 1;
    }

    const productsArr = await Product.find(filter)
                                     .skip((pageNumber - 1) * productsPerPage)
                                     .limit(productsPerPage);

    return {
        currentPage: pageNumber,
        previousPage: pageNumber - 1,
        nextPage: pageNumber + 1,
        lastPage: lastPage,
        productsArr: productsArr
    };
};

const standardResponse = (status, message) => ({ status, message });

// delete the product image file saved on the server
const deleteProductImage = (imagePath) => {
    try {
        const imageFilePath = path.join(__dirname, '..', '..', imagePath);
        fs.unlink(imageFilePath, (error) => {
            if (error) { console.log(error.message); }
        });

    } catch (error) {
        console.log(error.message);
    }
}

// push new error object in errorsArr
// error information will be extracted from errorObj
const addError = (errorsArr, errorObj) => {
    errorsArr.push({
        name: errorObj.name,
        message: errorObj.message,
        invalidFields: errorObj.invalidFields
    });
};

// returns different error instance depending on the errorKey
const createErrorInstance = (errorKey, errorMsg) => {
    switch (errorKey) {
        case 'name':
            return new NameError(errorMsg);
        case 'email':
            return new EmailError(errorMsg);
        case 'password':
            return new PasswordError(errorMsg);
        case 'passwordMismatch':
            return new PasswordMismatchError(errorMsg);
        case 'productName':
            return new ProductNameError(errorMsg);
        case 'description':
            return new ProductDescError(errorMsg);
        case 'notImageFile':
        case 'multerError':
            return new FileUploadError(errorMsg);
    }
};

/**
 * creates and error instance and adds it to errors array
 *
 * @param {errorsArr} array containing all errors to be returned to client
 * @param {errorKey} used to decide which error instance to create
 * @param {errorMsg} error message to be added in @param {errorArray}
 */
const createAndAddError = (errorsArr, errorKey, errorMsg) => {
    errorObj = createErrorInstance(errorKey, errorMsg);
    addError(errorsArr, createErrorInstance(errorKey, errorMsg));
};

// express error handler
const errorHandler = (error, req, res, next) => {
    const errorResponse = {
        status: 'error',
        statusCode: 400,
        errors: []
    };

    let errMsg, errKey, errReason;

    // custom field set on error object when passwords do not match while
    // registering new user
    if (typeof error.passwordsMatch !== 'undefined' && error.passwordsMatch !== null && !error.passwordsMatch) {
        createAndAddError(errorResponse.errors, 'passwordMismatch', 'passwords do not match');
    }

    switch (error.name) {
        case 'ValidationError':  // sign up error
            Object.keys(error.errors).forEach(errorKey => {
                errKey = errorKey;

                // validation error can contain 'name' key for user name and product name
                if (errorKey === 'name') {
                    errReason = error.errors[errorKey].properties.reason.name;
                    errKey = errReason == 'NameError' ? 'name' : 'productName';
                }

                errMsg = error.errors[errorKey].message;
                createAndAddError(errorResponse.errors, errKey, errMsg);
            });

            // used on password reset page
            // used to decide whether to hide password reset form or not
            // password reset form will not be hidden in case of validation error
            errorResponse.isValidationError = true;
            break;

        case 'MongoError':  // sign up error, duplicate email
            createAndAddError(errorResponse.errors, 'email', 'email already registered');
            break;

        case 'EmailError':  // forgot password error, invalid email provided
            createAndAddError(errorResponse.errors, 'email', error.message);
            break;

        case 'PasswordError':  // reset password error
            createAndAddError(errorResponse.errors, 'password', error.message);
            break;

        case 'FileUploadError':  // product image upload error, file not an image file
            createAndAddError(errorResponse.errors, 'notImageFile', error.message);
            break;

        case 'MulterError':  // invalid image file size, thrown by multer
            createAndAddError(errorResponse.errors, 'multerError', 'file too large, should be less than 1Mb');
            break;

        default:
            // if none of the switch case executed and
            // errorResponse.errors array is empty, then no need to send response
            // redirect user to 500 server error page
            if (errorResponse.errors.length <= 0) {
                console.log(error.message);
                res.redirect('/500');
                return;
            }
    }

    res.status(errorResponse.statusCode).send(errorResponse);
};

module.exports = {
    getAllProductsWithPaginationInfo,
    deleteProductImage,
    createAndAddError,
    standardResponse,
    errorHandler
};