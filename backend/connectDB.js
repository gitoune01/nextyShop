const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config
exports.connectDB = (cb) => {
  mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to DB')}).catch((err)=>{
        console.log(err)
    })
  cb()  
}