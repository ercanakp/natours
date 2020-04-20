const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const dataHandler = require('./dataHandler');

// const multerStorage = multer.diskStorage({
//  destination: (req, file, cb) => {
//   cb(null, 'public/img/users');
//  },
//  filename: (req, file, cb) => {
//   const ext = file.mimetype.split('/')[1];
//   cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//  }
// });

// Since we want to use image manipulation we have to use memoryStorage for high speed
// Because of no need write to disk and read from disk. It gets to memory buffer.
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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
 if (!req.file) return next();

 req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

 sharp(req.file.buffer)
  .resize(500, 500)
  .toFormat('jpeg')
  .jpeg({ quality: 90 })
  .toFile(`public/img/users/${req.file.filename}`);

 next();
};

const filterObj = (obj, ...allowedFields) => {
 let filteredObj = {};

 Object.keys(obj).forEach(el => {
  if (allowedFields.includes(el)) filteredObj[el] = obj[el];
 });

 return filteredObj;
};

exports.getMe = (req, res, next) => {
 req.params.id = req.user.id;
 next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
 // 1) If user data includes password or passwordConfirm do not update
 if (req.body.password || req.body.passwordConfirm) {
  return next(
   new AppError(
    'This route is not for password updates. Please use /updateMyPassword.',
    400
   )
  );
 }

 // 2) filter out unwanted field names that are not allowed to update
 const filteredFields = filterObj(req.body, 'name', 'email');
 if (req.file) filteredFields.photo = req.file.filename;

 // 3) Update user document
 const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredFields, {
  new: true,
  runValidatiors: true
 });

 res.status(200).json({
  status: 'success',
  data: {
   user: updatedUser
  }
 });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
 await User.findByIdAndUpdate(req.user.id, {
  active: false
 });

 res.status(204).json({
  status: 'success',
  data: null
 });
});

// TODO: This method and the route to this method can be deleted
exports.createUser = (req, res, next) => {
 res.status(500).json({
  status: 'error',
  message: 'You can create user only with signUp route!'
 });
};

exports.getUser = dataHandler.getOne(User);
exports.getAllUsers = dataHandler.getAll(User);
exports.updateUser = dataHandler.updateOne(User);
exports.deleteUser = dataHandler.deleteOne(User);
