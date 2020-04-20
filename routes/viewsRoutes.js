const express = require('express');
const viewsController = require('./../controllers/viewsController');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/', bookingController.createBookingCheckout,
    authController.isLoggedIn, viewsController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLogin);
router.get('/me', authController.checkAuthorization, viewsController.getAccount);
router.get('/my-tours', authController.checkAuthorization, viewsController.getMyTours);

router.post('/submit-user-data', authController.checkAuthorization, viewsController.updateUserData);

module.exports = router;