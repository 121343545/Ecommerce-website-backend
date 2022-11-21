const express=require('express')
const cookieParser=require('cookie-parser')
const errorMiddleware=require("./middleware/error")

const app=express();
app.use(express.json())
app.use(cookieParser())

//route imports

const product=require('./routes/productRoute')
const user=require('./routes/userRoute')
const order=require('./routes/orderRoutes')

app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);
//middleware for error

app.use(errorMiddleware)

module.exports=app;