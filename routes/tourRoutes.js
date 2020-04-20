const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);

// To use nested routes we will use "router.use('/:tourId/reviews', reviewRouter)". So, all the routes that begins with "/:tourId/reviews" will be redirected to the reviewRouter.
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-five-tours').get(tourController.topFiveTours);
router
  .route('/tour-stats')
  .get(
    authController.checkAuthorization,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getTourStats
  );
router.route('/monthly-plan/:year').get(authController.checkAuthorization, tourController.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  //.post(tourController.checkBody, tourController.createTour);
  .post(authController.checkAuthorization, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.checkAuthorization, authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourImages, tourController.resizeTourImages, tourController.updateTour)
  .delete(
    authController.checkAuthorization,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;