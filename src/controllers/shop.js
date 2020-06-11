const path = require('path');
const moment = require('moment');
const PdfPrinter = require('pdfmake');
const stripe = require('stripe')(process.env.STRIPE_SECRET_TEST_API_KEY);
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const {
    standardResponse,
    getAllProductsWithPaginationInfo
} = require('../utils/utils');

const showProductList = async (req, res, next) => {
    try {
        let pageNumber = parseInt(req.query.page) || 1;
        const productsPerPage = 8;

        const data = await getAllProductsWithPaginationInfo(
            pageNumber,
            productsPerPage,
            null
        );

        // if user is authenticated, hide 'add to cart' button for those products
        // which are already in user's cart
        // display 'added to cart' text instead
        if (req.session.isAuthenticated) {
            const user = await User.findOne({
                email: req.session.email
            }).select('cart');

            data.productsArr.forEach((prod) => {
                user.cart.forEach((cartProd) => {
                    if (prod._id.toString() === cartProd.productId.toString()) {
                        prod.isInCart = true;
                    }
                });
            });
        }

        res.render('./shop/product-list', {
            pageTitle: 'Shop',
            activePath: '/',
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

const showProductDetails = async (req, res, next) => {
    const productId = req.params.productId;

    try {
        const product = await Product.findOne({ _id: productId });
        const user = await User.findOne({
            email: req.session.email,
            'cart.productId': productId
        });

        // to disable/enable 'add to cart' button
        product.isInCart = user ? true : false;

        res.render('./shop/product-details', {
            activePath: '/product-details',
            pageTitle: product.name,
            product: product
        });
    } catch (error) {
        next(error);
    }
};

const showCart = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.session.email })
            .select('cart')
            .populate('cart.productId', 'name price imagePath');

        const cartProducts = [];

        user.cart.forEach((item) => {
            cartProducts.push({
                productId: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                imagePath: item.productId.imagePath,
                quantity: item.quantity
            });
        });

        res.render('./shop/cart', {
            pageTitle: 'Cart',
            activePath: '/cart',
            products: cartProducts
        });
    } catch (error) {
        next(error);
    }
};

const postCart = async (req, res, next) => {
    const productId = req.body.productIdField;

    try {
        const user = await User.findOne({ email: req.session.email });

        // check if product is already in cart or not
        const index = user.cart.findIndex((prod) => {
            return prod.productId.toString() === productId;
        });

        // if not in cart
        if (index === -1) {
            user.cart.push({ productId: productId, quantity: 1 });
            await user.save();
        }

        res.redirect('/');
    } catch (error) {
        next(error);
    }
};

const removeProductFromCart = async (req, res, next) => {
    const productId = req.body.productIdField;

    try {
        const user = await User.findOne({ email: req.session.email });
        const index = user.cart.findIndex(
            (prod) => prod.productId.toString() === productId
        );

        if (index !== -1) {
            user.cart.splice(index, 1);
        }

        await user.save();
        res.redirect('/cart');
    } catch (error) {
        next(error);
    }
};

const showMyOrdersPage = async (req, res, next) => {
    try {
        const orders = await Order.find({ userEmail: req.session.email });

        const myOrders = [];
        let orderGrandTotal = 0;
        let index = 0;

        /**
         * myOrders = [
         *      // single order object
         *      {
         *          orderNumber: 1234,
         *          products: [ { name: 'Lamp', quantity: 2, price: 12 } ],
         *          grandTotal: 100
         *          createdAt: 12-12-2019
         *      }
         * ];
         */
        orders.forEach((order) => {
            myOrders.push({ orderNumber: order._id });

            // format createdAt date
            const createdAt = moment(new Date(order.createdAt)).format(
                'dddd, MMMM Do YYYY, h:mm:ssA'
            );

            myOrders[index].createdAt = createdAt;
            myOrders[index].products = [];

            order.products.forEach((prod) => {
                myOrders[index].products.push({
                    name: prod.name,
                    quantity: prod.quantity,
                    price: prod.price
                });

                // add (product price * quantity) to grand total
                orderGrandTotal = orderGrandTotal + prod.price * prod.quantity;
            });

            // add grandTotal property to current order object
            myOrders[index].grandTotal = orderGrandTotal;

            //reset orderGrandTotal varaible
            orderGrandTotal = 0;
            index++;
        });

        res.render('./shop/orders', {
            pageTitle: 'My Orders',
            activePath: '/orders',
            orders: myOrders
        });
    } catch (error) {
        next(error);
    }
};

const showCheckoutPage = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.session.email })
            .select('cart')
            .populate('cart.productId', 'name price imagePath');

        const cart = user.cart;
        const checkoutProducts = [];
        let grandTotal = 0;

        cart.forEach((product) => {
            checkoutProducts.push({
                name: product.productId.name,
                price: product.productId.price,
                image: product.productId.imagePath,
                quantity: product.quantity
            });

            grandTotal += product.productId.price * product.quantity;
        });

        res.render('./shop/checkout', {
            pageTitle: 'Checkout',
            activePath: '/checkout',
            productsArr: checkoutProducts,
            grandTotal: grandTotal
        });
    } catch (error) {
        next(error);
    }
};

const order = async (req, res) => {
    // declare order variable outside try block
    // so that it can be accessed in catch block
    // to remove orders in case of any error
    let order = null;

    try {
        const user = await User.findOne({ email: req.session.email })
            .select('cart')
            .populate('cart.productId', 'name quantity price');

        const products = [];
        // calculate total order price and fill products array
        // with information about the order
        const totalPrice = user.cart.reduce((acc, curr) => {
            products.push({
                name: curr.productId.name,
                quantity: curr.quantity,
                price: curr.productId.price
            });

            return (acc += curr.productId.price * curr.quantity);
        }, 0);

        // save order record
        order = new Order({
            userEmail: req.session.email,
            products: products
        });
        await order.save();

        const token = req.body.stripeToken;
        const charge = await stripe.charges.create({
            amount: totalPrice * 100, // to convert cents in to dollars
            currency: 'usd',
            description: 'Demo charge',
            source: token,
            metadata: {
                order_id: order._id.toString(),
                userEmail: req.session.email
            }
        });

        // remove cart items
        user.cart = [];
        await user.save();

        // redirect user from client side
        res.status(400).send(standardResponse('success', 'payment completed'));
    } catch (error) {
        // roll back the entry made in orders collection
        await Order.deleteOne({ _id: order._id });
        res.status(400).send(standardResponse('error', error.message));
    }
};

const generateOrderInvoice = async (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceName = 'invoice-' + orderId + '.pdf';
    //const invoiceFilePath = path.join(__dirname, '..', 'invoices', invoiceName);
    const fontDirectory = path.join(
        __dirname,
        '..',
        'invoices',
        'font',
        'Roboto'
    );

    try {
        const order = await Order.findOne({ _id: orderId });

        // format createdAt date
        const createdAt = moment(new Date(order.createdAt)).format(
            'ddd, MMM Do YYYY, h:mm:ssA'
        );

        const orderProducts = order.products.map((item) => {
            return [item.name, item.price, item.quantity];
        });

        // calculate invoice grand total
        const total = orderProducts.reduce((acc, curr) => {
            return acc + curr[1] * curr[2];
        }, 0);

        // set font setting for pdfmake
        const font = {
            Roboto: {
                normal: path.join(fontDirectory, 'Roboto-Regular.ttf'),
                bold: path.join(fontDirectory, 'Roboto-Bold.ttf'),
                italics: path.join(fontDirectory, 'Roboto-RegularItalic.ttf'),
                bolditalics: path.join(fontDirectory, 'Roboto-BoldItalic.ttf')
            }
        };

        const pdfPrinter = new PdfPrinter(font);

        const docDefinition = {
            content: [
                {
                    text: 'Order Invoice',
                    style: 'title'
                },
                {
                    alignment: 'justify',
                    columns: [
                        {
                            text: [
                                {
                                    text: 'Order Number #',
                                    style: 'orderMetaInfo'
                                },
                                {
                                    text: `${order._id}`,
                                    style: ['orderMetaInfo', 'notBold']
                                }
                            ]
                        },
                        {
                            text: [
                                {
                                    text: `Order Date: `,
                                    style: ['orderMetaInfo', 'toRight']
                                },
                                {
                                    text: `${createdAt}`,
                                    style: ['orderMetaInfo', 'notBold']
                                }
                            ]
                        }
                    ],
                    style: 'marginBottom'
                },
                {
                    svg: `<svg height="10" width="687">
                            <line x1="0" y1="0" x2="515" y2="0" style="stroke:rgb(0,0,0);stroke-width:2" />
                          </svg>`
                },
                {
                    style: 'table',
                    table: {
                        headerRows: 1,
                        heights: 20,
                        widths: [350, '*', '*'],
                        body: [
                            [
                                { text: 'Products', style: 'tableHeader' },
                                { text: 'Price', style: 'tableHeader' },
                                { text: 'Quantity', style: 'tableHeader' }
                            ],
                            ...orderProducts
                        ]
                    }
                },
                {
                    text: `Total ($) = ${total}`,
                    style: ['total', 'toRight']
                }
            ],
            styles: {
                title: {
                    bold: true,
                    fontSize: 21,
                    alignment: 'center',
                    marginBottom: 10
                },
                orderMetaInfo: {
                    fontSize: 9.5,
                    bold: true
                },
                marginBottom: {
                    marginBottom: 5
                },
                notBold: {
                    bold: false
                },
                centered: {
                    alignment: 'center'
                },
                toRight: {
                    alignment: 'right'
                },
                table: {
                    marginTop: 8,
                    fontSize: 10
                },
                tableHeader: {
                    bold: true,
                    marginTop: 2.4,
                    fontSize: 11
                },
                total: {
                    marginTop: 10,
                    bold: true
                }
            }
        };

        const pdfDoc = pdfPrinter.createPdfKitDocument(docDefinition);

        // set headers to serve the pdf document in the browser
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'inline; filename="' + invoiceName + '"'
        );

        // save file on server in streams
        //pdfDoc.pipe(fs.createWriteStream(invoiceFilePath));
        // serve the file to the client browser in streams
        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (error) {
        next(error);
    }
};

const changeProdQuantityInCart = async (req, res, next) => {
    const productId = req.body.productIdField;
    const changeQuantity = req.params.changeQuantity;

    try {
        const user = await User.findOne({ email: req.session.email });

        user.cart.forEach((prod) => {
            if (prod.productId.toString() === productId) {
                if (changeQuantity.toLowerCase() === 'increase') {
                    prod.quantity += 1;
                } else {
                    prod.quantity -= 1;
                }
            }
        });

        await user.save();
        res.status(200).send(
            standardResponse('success', 'cart product quantity changed')
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    showProductList,
    showProductDetails,
    showCart,
    postCart,
    removeProductFromCart,
    showMyOrdersPage,
    showCheckoutPage,
    order,
    generateOrderInvoice,
    changeProdQuantityInCart
};
