const { appendFile } = require('fs')
const app=require('./App')
const dotenv=require("dotenv")
const connectDatabase=require("./config/database")

// handling uncaught exeption
process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`shutting down the server due to uncaught exeption`);
    process.exit(1);
})

//config
dotenv.config({path:"backend/config/config.env"})
connectDatabase()

const server=app.listen(process.env.PORT,()=>{
    console.log(`Server is listining at ${process.env.PORT}`)
})

//unhandled promise rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`shutting down the server due to unhandled rejection`);
    
    server.close(()=>{
        process.exit(1);
    })

})