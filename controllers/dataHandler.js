const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const QueryMethods = require('./../utils/queryMethods');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No item found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });

});

exports.updateOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });

});

exports.createOne = Model => catchAsync(async (req, res, next) => {

    const newDoc = await Model.create(req.body);

    if (!newDoc) {
        return next(new AppError('The item can not be created!', 400));
    }

    res.status(201).json({
        status: 'success',
        data: {
            data: newDoc
        }
    });

});

exports.getOne = (Model, pathOptions) => catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id);
    if (pathOptions) query = query.populate(pathOptions);
    const doc = await query;

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });

});

exports.getAll = Model => catchAsync(async (req, res, next) => {

    // To allow nested GET reviews on Tour
    let filter = {};
    if (req.params.tourId) filter = {
        tour: req.params.tourId
    };

    const queryResult = new QueryMethods(Model.find(filter), req.query)
        .filter()
        .sort()
        .showFields()
        .paginate();

    // const doc = await queryResult.query.explain();
    const doc = await queryResult.query;

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
});