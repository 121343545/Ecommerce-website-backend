const express=require('express')
const cookieParser=require('cookie-parser')
const errorMiddleware=require("./middleware/error")
const bodyParser=require("body-parser")
const fileupload=require("express-fileupload")
const dotenv=require("dotenv")






const app=express();
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileupload({
  useTempFiles:true
}));

dotenv.config({path:"backend/config/config.env"})

//route imports

const product=require('./routes/productRoute')
const user=require('./routes/userRoute')
const order=require('./routes/orderRoutes')
//const payment=require('./routes/paymentRoute')

app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);
//app.use("/api/v1",payment);
//middleware for error

app.use(errorMiddleware)

module.exports=app;