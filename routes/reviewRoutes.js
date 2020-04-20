const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// POST tour/tourId/reviews
// GET  tour/tourId/reviews

// The tourId does not exist here. So we have to use {mergeParams = true} as express.Router() param
const router = express.Router({
    mergeParams: true
});

router.use(authController.checkAuthorization);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.checkAuthorization,
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview);

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;