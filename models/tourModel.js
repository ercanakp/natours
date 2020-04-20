const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'A tour must have a name'],
    unique: true,
    minlength: [10, 'The tour name must have at least 10 characters.'],
    maxlength: [40, 'The tour name must have less or equal then 40 characters.']
    // validate: [validator.isAlpha, 'The tour name ({VALUE}) must only contain characters']
  },
  duration: {
    type: Number,
    require: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    require: [true, 'A tour must have a maxGroupSize']
  },
  difficulty: {
    type: String,
    require: [true, 'A tour must have a dificulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either : easy, medium, difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating can be at least 1.0'],
    max: [5, 'Rating can be maximum 5.0'],
    set: val => Math.round(val * 10) / 10
    // Math.round(4.6666666 * 10)  = Math.round(46.666666)= 47 / 10 = 4.7
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    require: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      // This type validator is not useable on Update (can not validate updates, only NEW)
      validator: function (val) {
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price'
    }
  },
  summary: {
    type: String,
    require: [true, 'A tour must have asummary'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    require: [true, 'A tour must have an imageCover']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  slug: String,
  secretTour: {
    type: Boolean,
    default: false,
    select: false
  },
  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [{
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  }],
  // guides: Array // is for embedding users to tour document
  guides: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }]
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

tourSchema.index({
  price: 1,
  ratingsAverage: -1
});
tourSchema.index({
  slug: 1
});
tourSchema.index({
  startLocation: '2dsphere'
});

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtuals populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE : runs before .save() and .create()
// but not .insertMany(), because .insertMany() does not trigger 'save' middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true
  });
  next();
});

// The below code embed users to tour document
/* tourSchema.pre('save', async function (next) {
   const guidesPromise = this.guides.map(async id => await User.findById(id));
   this.guides = await Promise.all(guidesPromise);
   next();
}); */

/* tourSchema.pre('save', function(next) {
  console.log('Will save document...');
  next();
});

tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
}); */

// QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function(next) {    // The line above is appliable for all methods starts 'find'
  this.find({
    secretTour: {
      $ne: true
    }
  });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds.`);
  // console.log(docs);
  next();
});

// AGGREGATE MIDDLEWARE

// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({
//     $match: {
//       secretTour: {
//         $ne: true
//       }
//     }
//   });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;