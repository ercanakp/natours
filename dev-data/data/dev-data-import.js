const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({
    path: './config.env'
});

// Connect to MongoDB ATLAS NatoursApp
/* const connectionString = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
); */

// Connect to Local Database NatoursApp
const connectionString = process.env.DATABASE_LOCAL;

mongoose
    .connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(con => {
        // con will be deleted
        //  console.log(con.connections);
        console.log('DB connection is successful!');
    });

// READ DATA FROM JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// IMPORT DATA INTO DB

const importAllTours = async () => {

    try {
        await Tour.create(tours);
        await User.create(users, {
            validateBeforeSave: false
        });
        await Review.create(reviews);

        console.log('Data successfully imported!');
    } catch (err) {
        console.log(err);
    }
    process.exit();

};

// DELETE ALL DATA FROM DB
const deleteAllTours = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();

        console.log('All data succesfully deleted!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// console.log(process.argv);

if (process.argv[2] === '--import') {
    importAllTours();
} else if (process.argv[2] === '--delete') {
    deleteAllTours();
}