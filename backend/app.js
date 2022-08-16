const express = require('express');
const errorMiddleware = require('./middlewares/error');
const app = express();
const productRoute = require('./routes/productRoute');
const orderRoute = require('./routes/orderRoute');
const userRoute = require('./routes/userRoute');
const paymentRoute = require('./routes/paymentRoute')
const cloudinary = require('cloudinary');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload')
const path  = require('path')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload())



//fichier routage

app.use('/api/v1/payments',paymentRoute)
app.use('/api/v1/products', productRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/orders', orderRoute);


if(process.env.NODE_ENV === 'PROD'){
    app.use(express.static(path.join(__dirname, '../../frontend/build')))  //inprod client/server listen on the same port
    app.get('*', (req, res)=> {
      res.sendFile(path.resolve(__dirname, '../../frontend/build/index.html'))
    })

}

//global middleware to handle errors
app.use(errorMiddleware);

module.exports = app;
