const app = require('./app');
const mongoose = require('mongoose');
// const dotenv = require('dotenv');
const { connectDB } = require('./connectDB');
const cloudinary = require('cloudinary')

if(process.env.NODE_ENV !== 'PROD') require('dotenv').dotenv.config()
;
//handle uncaught exceptions
process.on('uncaughtException',err =>{
  console.error(`ERROR: ${err.message}`)
  console.log("Shutting down server due to uncaught exception")
  process.exit(1)
})




//fichier connexions server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((err) => {
    console.log(err.message);
    return;
  });

const server = app.listen(PORT, () => {
  console.log(
    `Server listening on PORT ${PORT} on mode ${process.env.NODE_ENV}`
  );
});

//handle unhandled Promise rejections

process.on('unhandledRejection', (err) => {
  console.log(`ERROR: ${err.message}`);
  console.log('Shutting down server due to unhandled Promise rejection');
  server.close(() => {
    process.exit(1);
  });
});
