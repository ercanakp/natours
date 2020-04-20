/*
const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
*/

/*
// The below is a useful middleware; Keep it as a reference.
exports.checkID = (req, res, next, val) => {
    console.log(`The id is : ${val}`);

    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }

    next();
};
*/

// The below is a useful middleware; Keep it as a reference.
/* exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};
 */