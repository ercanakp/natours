const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewsRouter = require('./routes/viewsRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBALL MIDDLEWARES
// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP Headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
// app.use(express.json());
app.use(express.json({
  limit: '10kb'
})); // Limiting with 10kb
app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}));
app.use(cookieParser());


// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // Ex: try to login with correct password using {"email": {"$gt":""} , "password":"pass12345"} while app.use(mongoSanitize()) is commented

// Data sanitization against XSS (Cross-Side-Server injection)
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
  })
);

/* 
// our own middlewares
app.use((req, res, next) => {
    console.log('Hello from our own middleware function');
    next();
}); 
*/

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  // console.log(req.headers);
  next();
});

// 2) ROUTES
/* app.use('/', (req, res) => {
    res.status(200).send('Hello from server');
}); */

app.use('/', viewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// ERROR MIDDLEWARES
// a) simple middleware
/* app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
    next();
}); */

// b) A middleware that produces an error
/* 
app.all('*', (req, res, next) => {

    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.status = 'fail';
    err.statusCode = 404;

    next(err); // if next function takes a parameter, whatever is, express knows that there is an error exists
}); */

// c) The most modern error handling middleware, the above a and b is just for the reference
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ErrorHandler, This errorHandler middleware will be moved
// to the file 'errorController.js' under the controllers.
/* app.use((err, req, res, next) => {

   // console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
}); */

app.use(globalErrorHandler);

module.exports = app;