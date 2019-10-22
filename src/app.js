const express = require('express');
const path = require('path');
const expressSession = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(expressSession);
const connectFlash = require('connect-flash');
const bodyParser = require('body-parser');
const multer = require('multer');
const csrf = require('csurf');
const helmet = require('helmet');
const compression = require('compression');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const shopRouter = require('./routes/shop');
const errorController = require('./controllers/error');
const multerConfig = require('./image-upload/multer-config');
const authMiddleware = require('./middleware/auth');
const shopController = require('./controllers/shop');
const getCartCount = require('./middleware/cart-count');
const { errorHandler } = require('./utils/utils');

const app = express();

const viewsPath = path.join(__dirname, 'views');
const publicDirPath = path.join(__dirname, 'public');
const imgUploadPath = path.join(__dirname, '..', 'product-images');

const sessionStore = new MongoDbStore({
    uri: process.env.MONGODB_CONNECTION_STR,
    collection: 'sessions'
});

sessionStore.on('error', (error) => {
    console.log('error while initialzing mongo session store');
});

app.set('view engine', 'ejs');
app.set('views', viewsPath);

app.use(express.static(publicDirPath));
app.use('/product-images', express.static(imgUploadPath));
app.use(express.json());
// set secure headers
app.use(helmet());
// send compressed assets to client
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
// multer middleware should be before csurf middleware to avoid
// invalid csrf token error on file uplaod
app.use(multer(multerConfig).single('product-image-field'));
app.use(expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    unset: 'destroy'
}));
app.use(connectFlash());

// this route handler is defined here instead of with other routes
// to prevent invalid csrf token error with stripe form submission
app.post('/order', authMiddleware, getCartCount, shopController.order);

app.use(new csrf());

// pass 'isAuthenticated', 'isAdmin' data saved in session
// and csrf token to every page that is rendered
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.isAdmin = req.session.isAdmin;
    res.locals.csrfToken = req.csrfToken()
    next();
});

app.use('/admin', adminRouter);
app.use(authRouter);
app.use(shopRouter);
app.get('/500', errorController.serverErrorPage);
app.use('*', errorController.pageNotFound);
// express error handler
app.use(errorHandler);

module.exports = app;