const Product = require('../models/product');
const { getAllProductsWithPaginationInfo, deleteProductImage, standardResponse } = require('../utils/utils');

const addProductPage = (req, res) => {
    res.render('./admin/edit-product', {
        pageTitle: 'Add Product',
        activePath: '/add-product',
        editMode: false
    });
};

const addProduct = async (req, res, next) => {
    let image;

    try {
        const name = req.body['product-name-field'];
        const price = req.body['product-price-field'];
        const description = req.body['product-description-field'];

        if (req.file) {
            image = req.file;  // from multer

            const product = new Product({
                name: name,
                price: price,
                description: description,
                imagePath: image.path,
                userEmail: req.session.email
            });

            await product.save();
            res.status(200).send(standardResponse('success', 'product added successfully'));
        }

    } catch (error) {
        // delete uploaded image in case of error while adding new product
        deleteProductImage(image.path);
        next(error);
    }
};

const editProductPage = async (req, res, next) => {
    const productId = req.params.productId;

    try {
        const product = await Product.findOne({_id: productId});

        res.render('./admin/edit-product', {
            activePath: '/edit-product',
            pageTitle: 'Edit Product',
            editMode: true,
            product: product
        });

    } catch (error) {
        next(error);
    }
};

const editProduct = async (req, res, next) => {
    const productId = req.body.productIdField;

    const name = req.body['product-name-field'];
    const price = req.body['product-price-field'];
    const description = req.body['product-description-field'];
    let imgPath;

    // check if user updated product image
    if (req.file) {
        imgPath = req.file.path;
    }

    try {
        const product = await Product.findOne({ _id: productId });

        const updatedProductInfo = {
            name: name,
            price: price,
            description: description
        };

        // if user chose new image while editing product then update
        // product image path
        if (imgPath) {
            updatedProductInfo.imagePath = imgPath;
            // delete old image
            deleteProductImage(product.imagePath);
        }

        // admin can edit only those products which were created by him
        if (product.userEmail === req.session.email) {
            await Product.updateOne({_id: productId}, updatedProductInfo, { runValidators: true });
        }

        // redirect from client side (edit-product.js)
        res.status(200).send(standardResponse('success', 'product info updated'));

    } catch (error) {
        // in case of error, delete the uploaded image if any
        if (imgPath) { deleteProductImage(imgPath); }
        next(error);
    }
};

const showAdminProductsPage = async (req, res, next) => {
    try {
        let pageNumber = parseInt(req.query.page) || 1;
        const productsPerPage = 8;

        const data = await getAllProductsWithPaginationInfo(pageNumber, productsPerPage, req.session.email);

        res.render('./admin/products', {
            pageTitle: 'Shop',
            activePath: '/admin/products',
            productsArr: data.productsArr,
            currentPage: data.currentPage,
            previousPage: data.previousPage,
            nextPage: data.nextPage,
            lastPage: data.lastPage
        });

    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    const productId = req.body.productIdField;

    try {
        const product = await Product.findOne({ _id: productId });

        // admin can delete only those products which were created by him
        if (product.userEmail === req.session.email) {
            // delete the product image file saved on the server
            deleteProductImage(product.imagePath);
            // delete the product
            await Product.deleteOne({ _id: productId });
        }

        res.redirect('/admin/products');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addProductPage,
    addProduct,
    editProductPage,
    editProduct,
    showAdminProductsPage,
    deleteProduct
};