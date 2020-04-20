const mongoose = require('mongoose');
const dotenv = require('dotenv');

// In order to catch uncaught exceptions the code below must be executed before anything else executed.
// If any executed code bofeore this code yields an uncaughtException than  this code can not catch error.

/* process.on('uncaughtException', err => {

  if (process.env.NODE_ENV === 'production') {
    console.log('UNCAUGHT EXCEPTION 💥 > Shutting down...');
    console.log(err.name, ' : ', err.message);
  }
  process.exit(1);

}); */

dotenv.config({
  path: './config.env'
});

const app = require('./app');

const connectionString = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
  // This is for Mongodb ATLAS Connection  
  // .connect(connectionString, {

  // This is for local database connection
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection is successful!');
  });
// We can catch unhandledRejection by ending this promise with catch(err=>{ ... }). But we used an process.on('unhandledRejection', err=>{...}) error handler code in order to catch all kinde of errors that is not defined after then() part of promises. 

// 
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App server is listening at port ${port}...`);
});

process.on('unhandledRejection', err => {

  console.log('UNHANDLED REJECTION! 💥 : Shutting down...');
  console.log(err.name, ':', err.message);

  server.close(() => {
    process.exit(1);
  });

});