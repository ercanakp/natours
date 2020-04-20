const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const dataHandler = require('./../controllers/dataHandler');

exports.getAllReviews = catchAsync(async (req, res, next) => {

    let filter = {};
    if (req.params.tourId) filter = {
        tour: req.params.tourId
    };

    const reviews = await Review.find(filter);

    if (!reviews) {
        return next(new AppError('There is no review!', 404));
    }

    res.status(200).json({
        status: 'success',
        result: reviews.length,
        data: {
            reviews
        }
    });

});

// Since createReview has extra if conditions we will handle these in middleware and apply this middleware to the post route like ".post(..., reviewController.setTourUserIds, reviewController.createReview)"
exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
};

/* exports.createReview = catchAsync(async (req, res, next) => {

    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

    if (!newReview) {
        return next(new AppError('The review could not inserted!', 404));
    }

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});
 */
exports.createReview = dataHandler.createOne(Review);
exports.getReview = dataHandler.getOne(Review);
exports.getAllReviews = dataHandler.getAll(Review);
exports.updateReview = dataHandler.updateOne(Review);
exports.deleteReview = dataHandler.deleteOne(Review);