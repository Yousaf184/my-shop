const multer = require('multer');
const uuidv4 = require('uuid/v4');
const { FileUploadError } = require('../custom-errors/admin/edit-product');

// configure how to store uploaded image file
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'product-images');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname);
    }
});

// multer configuration
const multerConfig = {
    storage: fileStorage,
    limits: {
        fileSize: 1000000     // 1 MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            cb(null, true);
            return;
        }

        cb(new FileUploadError('invalid file. Allowed file types are (png, jpg, jpeg)'));
    }
};

module.exports = multerConfig;

