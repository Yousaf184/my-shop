class ProductNameError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ProductNameError';
        this.invalidFields = ['product-name-field'];
    }
}

class FileUploadError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FileUploadError';
        this.invalidFields = ['product-image-field'];
    }
}

class ProductDescError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ProductDescError';
        this.invalidFields = ['product-description-field'];
    }
}

module.exports = {
    ProductNameError,
    FileUploadError,
    ProductDescError
};

