const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const dataHandler = require('./dataHandler');

// This original getTours is not deleted, just commented out for reference.
// And below this commented section, catchAsync function (an error catching on async functions)
// applied all async functions.
/* exports.getAllTours = async (req, res) => {
   try {
      // EXECUTE QUERY
 
      const queryResult = new QueryMethods(Tour.find(), req.query)
         .filter()
         .sort()
         .showFields()
         .paginate();

      const tours = await queryResult.query;

      // SEND RESPONSE
      res.status(200).json({
         status: 'success',
         results: tours.length,
         data: {
            tours
         }
      });
   } catch (err) {
      res.status(400).json({
         status: 'fail',
         message: {
            name: err.name,
            desc: err.message
         }
      });
   }
}; */

/* exports.getAllTours = catchAsync(async (req, res, next) => {
   const queryResult = new QueryMethods(Tour.find(), req.query)
      .filter()
      .sort()
      .showFields()
      .paginate();

   const tours = await queryResult.query;

   res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
         tours
      }
   });
}); */

/* exports.getTour = catchAsync(async (req, res, next) => {

   // Keep the two lines of code as a reference
   //  const id = req.params.id * 1;
   //  const tour = tours.find(el => el.id === id);

   // const tour = await Tour.findById(req.params.id);
   // const tour = Tour.findOne({_id:req.params.id})

   // in order to get all virtual reviews use below 
   const tour = await Tour.findById(req.params.id).populate('reviews');

   if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
   }

   res.status(200).json({
      status: 'success',
      data: {
         tour
      }
   });

}); */

/* exports.createTour = catchAsync(async (req, res, next) => {

   // Keep below code as a reference of Object.assign, don't delete it.
   //   const newId = tours[tours.length - 1].id + 1;
   //      const newTour = Object.assign({
   //              id: newId
   //          },
   //          req.body
   //      ); 

   // We can use two lines below instead of shorthand below two lines
   // const tour = new Tour(req.body);
   // tour.save();

   const newTour = await Tour.create(req.body);

   res.status(201).json({
      status: 'success',
      data: {
         tour: newTour
      }
   });

}); */

/* exports.updateTour = catchAsync(async (req, res, next) => {

   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
   });

   if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
   }

   res.status(200).json({
      status: 'success',
      data: {
         tour
      }
   });

}); */

/* exports.deleteTour = catchAsync(async (req, res, next) => {

   const tour = await Tour.findByIdAndDelete(req.params.id);

   if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
   }

   res.status(204).json({
      status: 'success',
      data: null
   });

}); */

// IMAGE UPLOAD SECTION [ imageCover and 3 images ]
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([{
    name: 'imageCover',
    maxCount: 1
  },
  {
    name: 'images',
    maxCount: 3
  }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {

  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Upload imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({
      quality: 90
    })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Upload images
  req.body.images = [];

  // since aysnc/await used we can not use forEach instead map all async/await and Promise.all
  //  req.files.images.forEach(async (file, idx) => {

  await Promise.all(req.files.images.map(async (file, idx) => {

    const filename = `tour-${req.params.id}-${Date.now()}-${idx+1}.jpeg`;

    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({
        quality: 90
      })
      .toFile(`public/img/tours/${filename}`);

    req.body.images.push(filename);

  }));

  next();

});

exports.createTour = dataHandler.createOne(Tour);
exports.getTour = dataHandler.getOne(Tour, {
  path: 'reviews'
});
exports.getAllTours = dataHandler.getAll(Tour);
exports.updateTour = dataHandler.updateOne(Tour);
exports.deleteTour = dataHandler.deleteOne(Tour);

exports.topFiveTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty,summary';
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([{
      $match: {
        ratingsAverage: {
          $gte: 4.5
        }
      }
    },
    {
      $group: {
        // no group
        //_id: null,
        // group by 'difficulty' with transformed uppercase
        _id: {
          $toUpper: '$difficulty'
        },
        numTours: {
          $sum: 1
        },
        numAverages: {
          $avg: '$ratingsQuantity'
        },
        avgRating: {
          $avg: '$ratingsAverage'
        },
        avgPrice: {
          $avg: '$price'
        },
        minPrice: {
          $min: '$price'
        },
        maxPrice: {
          $max: '$price'
        }
      }
    },
    {
      $sort: {
        avgPrice: 1
      }
    }
    /*,
      {
        // match the group which is not including 'EASY' tours
        $match:{ _id: {$ne:'EASY'}}
      }
      */
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  console.log(year, '------------ year');

  const plan = await Tour.aggregate([{
      $unwind: '$startDates'
    },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: {
          $month: '$startDates'
        },
        numTourStarts: {
          $sum: 1
        },
        tours: {
          $push: '$name'
        }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },

    {
      $sort: {
        numTourStarts: -1
      }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    numTours: plan.length,
    data: {
      plan
    }
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/200/center/34.451682,-118.087592/unit/mi
// /tours-within?distance=200&center=34.451682,-118.087592&unit=mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const {
    distance,
    latlng,
    unit
  } = req.params;
  const [lat, lng] = latlng.split(',');

  // The distance must be converted to the radius. In order to convert mile to the radius; we must divide distance to 3963.2, for km we must divide distance to 6378.1)
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('Please provide latitude or longitude in format lat, lng', 400));
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [
          [lng, lat], radius
        ]
      }
    }
  });

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const {
    latlng,
    unit
  } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;

  if (!lat || !lng) {
    next(new AppError('Please provide latitude or longitude in format lat, lng', 400));
  }

  const distances = await Tour.aggregate([{
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        name: 1,
        distance: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});